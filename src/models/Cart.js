import mongoose, { Schema } from "mongoose";

const CartSchema = mongoose.Schema({
	storeID: {
		type: Schema.Types.ObjectId,
		require: true,
		ref: "stores",
	},
	userID: {
		type: Schema.Types.ObjectId,
		require: true,
		ref: "users",
	},
	productID: {
		type: Schema.Types.ObjectId,
		require: true,
		ref: "products",
	},
	price: { type: Number, required: true },
	units: { type: Number, default: 1 },
	products: [
		{
			productID: {
				type: Schema.Types.ObjectId,
				ref: "products",
			},
			units: {
				type: Number,
			},
		},
	],
});

CartSchema.virtual("id").get(function () {
	return this._id.toHexString();
});

CartSchema.set("toJSON", {
	virtual: true,
});

export const CartModel = mongoose.model("cart", CartSchema);
