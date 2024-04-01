import mongoose, { Schema } from "mongoose";

const OrderItemsSchema = mongoose.Schema({
	orderID: {
		type: Schema.Types.ObjectId,
		require: true,
		ref: "orders",
	},
	userID: {
		type: Schema.Types.ObjectId,
		require: true,
		ref: "users",
	},
	storeID: {
		type: Schema.Types.ObjectId,
		require: true,
		ref: "stores",
	},
	productID: {
		type: Schema.Types.ObjectId,
		require: true,
		ref: "products",
	},
	price: { type: Number },
	units: { type: Number },
	subtotal: { type: Number },
});

OrderItemsSchema.virtual("id").get(function () {
	return this._id.toHexString();
});

OrderItemsSchema.set("toJSON", {
	virtual: true,
});

export const OrdersItemModel = mongoose.model("order-items", OrderItemsSchema);
