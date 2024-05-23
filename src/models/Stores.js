import mongoose from "mongoose";

const StoreSchema = mongoose.Schema({
	name: { type: String, required: true, unique: true },
	address: { type: String, required: true },
	description: { type: String, required: true },
	contactperson: { type: String, required: true },
	contactno: { type: String, required: true },
	storehour: { type: String, required: true },
	image: { type: String, default: "" },
	createAt: {
		type: Date,
		default: Date.now,
	},
});

StoreSchema.virtual("id").get(function () {
	return this._id.toHexString();
});

StoreSchema.set("toJSON", {
	virtual: true,
});

export const StoreModel = mongoose.model("stores", StoreSchema);
