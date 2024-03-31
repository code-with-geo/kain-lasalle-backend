import mongoose, { Schema } from "mongoose";

const OrderSchema = mongoose.Schema({
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
