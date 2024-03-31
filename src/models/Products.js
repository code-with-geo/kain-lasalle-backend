import mongoose, { Schema } from "mongoose";

const ProductSchema = mongoose.Schema({
	storeID: {
		type: Schema.Types.ObjectId,
		require: true,
		ref: "stores",
	},
	sku: { type: String, required: true, unique: true, uppercase: true },
	name: { type: String, required: true },
	description: { type: String, required: true },
	image: { type: String, default: "" },
	price: { type: Number, required: true },
	units: { type: Number, default: 1 },
});

ProductSchema.virtual("id").get(function () {
	return this._id.toHexString();
});

ProductSchema.set("toJSON", {
	virtual: true,
});

export const ProductModel = mongoose.model("products", ProductSchema);
