import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
	email: { type: String, unique: true, require: true },
	password: { type: String },
	name: { type: String },
	phonenumber: { type: String },
	verified: { type: Boolean, default: false },
});

UserSchema.virtual("id").get(function () {
	return this._id.toHexString();
});

UserSchema.set("toJSON", {
	virtual: true,
});

export const UsersModel = mongoose.model("users", UserSchema);
