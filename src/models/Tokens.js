import mongoose, { Schema } from "mongoose";

const VerificationTokenSchema = mongoose.Schema({
	userID: {
		type: Schema.Types.ObjectId,
		require: true,
		ref: "users",
		unique: true,
	},
	token: {
		type: String,
		require: true,
	},
	createAt: {
		type: Date,
		default: Date.now(),
		expires: 3600,
	},
});

const ResetPassTokenSchema = mongoose.Schema({
	userID: {
		type: Schema.Types.ObjectId,
		require: true,
		ref: "users",
		unique: true,
	},
	token: {
		type: String,
		require: true,
	},
	createAt: {
		type: Date,
		default: Date.now(),
		expires: 3600,
	},
});

export const VerificationTokenModel = mongoose.model(
	"verificationtoken",
	VerificationTokenSchema
);

export const ResetPassTokenModel = mongoose.model(
	"resetpasstoken",
	ResetPassTokenSchema
);
