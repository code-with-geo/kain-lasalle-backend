import { CartModel } from "../models/Cart.js";
import { ProductModel } from "../models/Products.js";
import { Types } from "mongoose";

export const addToCart = async (req, res) => {
	try {
		const { userID, productID, price, units } = req.body;
		const { storeID } = req.params;
		let cart = await CartModel.findOne({ userID });

		if (cart) {
			if (storeID.match(/^[0-9a-fA-F]{24}$/)) {
				if (cart.storeID != storeID) {
					return res.json({
						responsecode: "402",
						message: "Adding product from different store",
					});
				}
			} else {
				return res.json({
					responsecode: "402",
					message: "Invalid url",
				});
			}
		}

		cart = await CartModel.findOne({
			storeID,
			userID,
			productID,
		});
		if (cart) {
			let newUnit = parseInt(cart.units) + parseInt(units);
			let subTotal = parseInt(cart.price) * parseInt(newUnit);
			await CartModel.updateOne(
				{
					storeID,
					userID,
					productID,
				},
				{ $set: { units: newUnit, subtotal: subTotal } }
			);

			return res.json({
				responsecode: "200",
				message: "Product successfully added to cart.",
			});
		}

		cart = await new CartModel({
			storeID,
			userID,
			productID,
			price,
			units,
		}).save();

		return res.json({
			responsecode: "200",
			message: "Product successfully added to cart.",
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const removeFromCart = async (req, res) => {
	try {
		const { userID, productID } = req.body;

		let cart = await CartModel.findOne({ userID, productID });

		if (cart) {
			if (cart.units <= 1) {
				cart = await CartModel.deleteOne({ userID, productID });
				return res.send({
					responsecode: "200",
					message: "Product successfully removed from cart",
				});
			} else {
				let newUnit = parseInt(cart.units) - 1;
				let subTotal = parseInt(cart.price) * parseInt(newUnit);
				await CartModel.updateOne(
					{
						userID,
						productID,
					},
					{ $set: { units: newUnit, subtotal: subTotal } }
				);

				return res.send({
					responsecode: "200",
					message: "Product successfully updated from cart",
				});
			}
		}

		return res.send({
			responsecode: "402",
			message: "Product not found",
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const getCartProduct = async (req, res) => {
	try {
		const { userID } = req.body;

		let cart = await CartModel.find({ userID });
		if (cart) {
			const { userID } = req.body;
			cart = await CartModel.aggregate([
				{
					$lookup: {
						from: "products",
						localField: "productID",
						foreignField: "_id",
						as: "product",
					},
				},
				{
					$lookup: {
						from: "stores",
						localField: "storeID",
						foreignField: "_id",
						as: "store",
					},
				},
			]).match({ userID: new Types.ObjectId(userID) });

			return res.json({
				responsecode: "200",
				cart: cart,
			});
		} else {
			return res.send({
				responsecode: "402",
				message: "Cart is empty",
			});
		}
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const getCartCount = async (req, res) => {
	try {
		const { userID } = req.body;

		let cart = await CartModel.find({ userID });
		if (!cart) {
			return res.send({
				responsecode: "402",
				message: "Cart is empty",
			});
		}

		cart = await CartModel.countDocuments({ userID });

		return res.json({
			responsecode: "200",
			cart: cart,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};
