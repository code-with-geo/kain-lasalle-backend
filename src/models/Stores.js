import mongoose from "mongoose";

const StoreSchema = mongoose.Schema({
	name: { type: String, required: true, unique: true },
	description: { type: String, required: true },
	image: { type: String, default: "" },
});

StoreSchema.virtual("id").get(function () {
	return this._id.toHexString();
});

StoreSchema.set("toJSON", {
	virtual: true,
});

export const StoreModel = mongoose.model("stores", StoreSchema);
