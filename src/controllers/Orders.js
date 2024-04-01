import { CartModel } from "../models/Cart.js";
import { OrdersItemModel } from "../models/OrderItems.js";
import { OrdersModel } from "../models/Orders.js";
import dotenv from "dotenv";
dotenv.config();

export const createOrder = async (req, res) => {
	try {
		const { userID, storeID, total } = req.body;
		if (!userID.match(/^[0-9a-fA-F]{24}$/)) {
			return res.send({
				responsecode: "402",
				message: "User not found.",
			});
		}

		let cart = await CartModel.find({ userID });

		if (!cart) {
			return res.send({
				responsecode: "402",
				message: "No item found for this user",
			});
		}

		const options = {
			method: "POST",
			headers: {
				accept: "application/json",
				"content-type": "application/json",
				authorization: `Basic ${process.env.PAYMONGO_AUTH}`,
			},
			body: JSON.stringify({
				data: { attributes: { amount: total * 100, description: "payment" } },
			}),
		};
		let url = await fetch("https://api.paymongo.com/v1/links", options)
			.then((response) => response.json())
			.then(async (response) => {
				let order = await new OrdersModel({
					userID,
					storeID,
					total,
					paymentID: response.data.id,
					paymentUrl: response.data.attributes.checkout_url,
					paymentReferenceNumber: response.data.attributes.reference_number,
				}).save();

				let cart = await CartModel.find({ userID });
				if (cart) {
					cart.map(async (value) => {
						return await new OrdersItemModel({
							orderID: order._id,
							userID: value.userID,
							storeID: value.storeID,
							price: value.price,
							units: value.units,
							subtotal: value.subtotal,
						}).save();
					});
				}

				cart = await CartModel.deleteMany({ userID });
				return order.paymentUrl;
			})
			.catch((err) => console.error(err));
		return res.json({
			responsecode: "200",
			paymenturl: url,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const getAllOrders = async (req, res) => {
	try {
		const { userID } = req.body;

		if (!userID.match(/^[0-9a-fA-F]{24}$/)) {
			return res.send({
				responsecode: "402",
				message: "User not found.",
			});
		}

		let orders = await OrdersModel.find({ userID });

		if (!orders) {
			return res.send({
				responsecode: "402",
				message: "No orders found for this user",
			});
		}

		orders = await OrdersModel.aggregate([
			{
				$lookup: {
					from: "users",
					localField: "userID",
					foreignField: "_id",
					as: "user",
				},
			},
			{
				$lookup: {
					from: "stores",
					localField: "storeID",
					foreignField: "_id",
					as: "user",
				},
			},
		]);

		return res.json({
			responsecode: "200",
			orders: orders,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const verifyPayment = async (req, res) => {};
