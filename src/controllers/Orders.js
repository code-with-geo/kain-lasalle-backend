import { CartModel } from "../models/Cart.js";
import { OrdersItemModel } from "../models/OrderItems.js";
import { OrdersModel } from "../models/Orders.js";
import { ProductModel } from "../models/Products.js";
import { Types } from "mongoose";
import dotenv from "dotenv";
import EmailSender from "../helper/EmailSender.js";
import { UsersModel } from "../models/Users.js";
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
							productID: value.productID,
							price: value.price,
							units: value.units,
							subtotal: value.subtotal,
						}).save();
					});
				}

				let user = await UsersModel.findOne({ _id: userID });
				const originalDateString = order.estimatedDateTime;
				const originalDate = new Date(originalDateString);

				const formattedDate = originalDate
					.toISOString()
					.replace(/T/, " ")
					.replace(/\..+/, "");

				await EmailSender(
					user.email,
					"Order Notification",
					`Hi there, \n You're order ID ${order._id} will be ready at ${formattedDate}. Once your order is ready we'll send another notification. Please check your email. \n Thank you,`
				);

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

export const getOrdersByStoreID = async (req, res) => {
	try {
		const { storeID } = req.body;

		if (!storeID.match(/^[0-9a-fA-F]{24}$/)) {
			return res.send({
				responsecode: "402",
				message: "Order not found.",
			});
		}

		let orders = await OrdersModel.find({ storeID });

		if (!orders) {
			return res.send({
				responsecode: "402",
				message: "No orders found for this store",
			});
		}

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

export const getOrderItemByID = async (req, res) => {
	try {
		const { orderID } = req.body;

		if (!orderID.match(/^[0-9a-fA-F]{24}$/)) {
			return res.send({
				responsecode: "402",
				message: "Order not found.",
			});
		}

		let orderItems = OrdersItemModel.find({ orderID });

		if (orderItems) {
			const { orderID } = req.body;

			orderItems = await OrdersItemModel.aggregate([
				{
					$lookup: {
						from: "products",
						localField: "productID",
						foreignField: "_id",
						as: "products",
					},
				},
			]).match({ orderID: new Types.ObjectId(orderID) });

			return res.json({
				responsecode: "200",
				orders: orderItems,
			});
		} else {
			return res.send({
				responsecode: "402",
				message: "No order items found",
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

export const getOrdersByOrderID = async (req, res) => {
	try {
		const { orderID } = req.body;

		if (!orderID.match(/^[0-9a-fA-F]{24}$/)) {
			return res.send({
				responsecode: "402",
				message: "Order not found.",
			});
		}

		let orders = await OrdersModel.find({ _id: orderID });

		if (!orders) {
			return res.send({
				responsecode: "402",
				message: "No orders found for this store",
			});
		}

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

export const completeOrder = async (req, res) => {
	try {
		const { orderID } = req.body;

		if (!orderID.match(/^[0-9a-fA-F]{24}$/)) {
			return res.send({
				responsecode: "402",
				message: "Order not found.",
			});
		}

		let orders = await OrdersModel.findOne({ _id: orderID });
		if (orders) {
			if (orders.paymentStatus !== "pending") {
				if (orders.orderStatus != "complete") {
					await OrdersModel.updateOne(
						{ _id: orderID },
						{ $set: { orderStatus: "complete" } }
					);

					await EmailSender(
						user.email,
						"Orders Complete",
						`Hi there, \n You're order ID ${orderID} is complete and ready to pick up.\n Thank you,`
					);
					return res.json({
						responsecode: "200",
						message: "Orders completed",
					});
				}
				return res.json({
					responsecode: "200",
					message: "Order already complete",
				});
			} else {
				let status = "";
				const options = {
					method: "GET",
					headers: {
						accept: "application/json",
						authorization: "Basic c2tfdGVzdF9TNWdGUjd4QmQ2UzRGTXJoYlBMZFB0Qlk6",
					},
				};

				let verify = await fetch(
					`https://api.paymongo.com/v1/links/${orders.paymentID}`,
					options
				)
					.then((response) => response.json())
					.then((response) => {
						status = response.data.attributes.status;
						return status;
					})
					.catch((err) => console.error(err));

				if (verify != "unpaid") {
					await OrdersModel.updateOne(
						{ _id: orderID },
						{ $set: { paymentStatus: "paid" } }
					);

					return res.json({
						responsecode: "402",
						message: "Order already paid",
					});
				} else {
					return res.json({
						responsecode: "200",
						paymentURL: orders.paymentUrl,
					});
				}
			}
		} else {
			return res.send({
				responsecode: "402",
				message: "Order not found.",
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

export const verifyPayment = async (req, res) => {
	try {
		const { orderID } = req.body;

		if (!orderID.match(/^[0-9a-fA-F]{24}$/)) {
			return res.send({
				responsecode: "402",
				message: "Order not found.",
			});
		}

		let orders = await OrdersModel.findOne({ _id: orderID });
		if (orders) {
			if (orders.paymentStatus !== "pending") {
				return res.json({
					responsecode: "200",
					message: "Order already paid",
				});
			} else {
				let status = "";
				const options = {
					method: "GET",
					headers: {
						accept: "application/json",
						authorization: `Basic ${process.env.PAYMONGO_AUTH}`,
					},
				};

				let verify = await fetch(
					`https://api.paymongo.com/v1/links/${orders.paymentID}`,
					options
				)
					.then((response) => response.json())
					.then((response) => {
						status = response.data.attributes.status;
						return status;
					})
					.catch((err) => console.error(err));

				if (verify != "unpaid") {
					await OrdersModel.updateOne(
						{ _id: orderID },
						{ $set: { paymentStatus: "paid" } }
					);

					return res.json({
						responsecode: "402",
						message: "Order already paid",
					});
				} else {
					return res.json({
						responsecode: "200",
						paymentURL: orders.paymentUrl,
					});
				}
			}
		} else {
			return res.send({
				responsecode: "402",
				message: "Order not found.",
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

export const getAllPendingOrder = async (req, res) => {
	try {
		try {
			const { storeID } = req.body;

			if (!storeID.match(/^[0-9a-fA-F]{24}$/)) {
				return res.send({
					responsecode: "402",
					message: "Order not found.",
				});
			}

			let orders = await OrdersModel.find({ storeID, orderStatus: "pending" });

			if (!orders) {
				return res.send({
					responsecode: "402",
					message: "No orders found for this store",
				});
			}

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
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const getOrdersCount = async (req, res) => {
	try {
		const { storeID } = req.body;

		if (!storeID.match(/^[0-9a-fA-F]{24}$/)) {
			return res.send({
				responsecode: "402",
				message: "Order not found.",
			});
		}

		let orders = await OrdersModel.countDocuments({ storeID });

		if (!orders) {
			return res.send({
				responsecode: "402",
				message: "No orders found for this store",
			});
		}

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

export const getAllUnpaidOrder = async (req, res) => {
	try {
		try {
			const { storeID } = req.body;

			if (!storeID.match(/^[0-9a-fA-F]{24}$/)) {
				return res.send({
					responsecode: "402",
					message: "Order not found.",
				});
			}

			let orders = await OrdersModel.countDocuments({
				storeID,
				paymentStatus: "pending",
			});

			if (!orders) {
				return res.send({
					responsecode: "402",
					message: "No orders found for this store",
				});
			}

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
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const getSoldOutProducts = async (req, res) => {
	try {
		try {
			const { storeID } = req.body;

			if (!storeID.match(/^[0-9a-fA-F]{24}$/)) {
				return res.send({
					responsecode: "402",
					message: "Product not found.",
				});
			}

			let products = await ProductModel.countDocuments({
				storeID,
				units: 0,
			});

			if (!products) {
				return res.send({
					responsecode: "402",
					message: "No product found for this store",
				});
			}

			return res.json({
				responsecode: "200",
				products: products,
			});
		} catch (err) {
			console.log(err);
			return res.status(500).send({
				responsecode: "500",
				message: "Please contact technical support.",
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

export const getCancelledOrdeCount = async (req, res) => {
	try {
		try {
			const { storeID } = req.body;

			if (!storeID.match(/^[0-9a-fA-F]{24}$/)) {
				return res.send({
					responsecode: "402",
					message: "Order not found.",
				});
			}

			let orders = await OrdersModel.countDocuments({
				storeID,
				orderStatus: "cancelled",
			});

			if (!orders) {
				return res.send({
					responsecode: "402",
					message: "No orders found for this store",
				});
			}

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
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};
