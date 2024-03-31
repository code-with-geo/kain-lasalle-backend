import mongoose, { Schema } from "mongoose";

const VendorSchema = mongoose.Schema({
	storeID: {
		type: Schema.Types.ObjectId,
		require: true,
		ref: "stores",
	},
	email: { type: String, unique: true, require: true },
	password: { type: String },
	name: { type: String },
	phonenumber: { type: String },
	verified: { type: Boolean, default: false },
	isAdmin: { type: Boolean, default: false },
});

VendorSchema.virtual("id").get(function () {
	return this._id.toHexString();
});

VendorSchema.set("toJSON", {
	virtual: true,
});

export const VendorModel = mongoose.model("vendors", VendorSchema);
