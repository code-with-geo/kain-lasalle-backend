import mongoose, { Schema } from "mongoose";

const OrderSchema = mongoose.Schema({
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
	vendorID: {
		type: Schema.Types.ObjectId,
		ref: "vendors",
	},
	total: { type: Number },
	orderDateTime: {
		type: Date,
		default: () => new Date(Date.now() + 8 * 60 * 60 * 1000),
	},
	estimatedDateTime: {
		type: Date,
		default: () => new Date(Date.now() + 8 * 60 * 60 * 1000 + 30 * 60 * 1000),
	},
	paymentID: { type: String, require: true },
	paymentUrl: { type: String, require: true },
	paymentReferenceNumber: { type: String, require: true },
	paymentType: { type: String },
	paymentStatus: { type: String, default: "pending" },
	orderStatus: { type: String, default: "pending" },
});

OrderSchema.virtual("id").get(function () {
	return this._id.toHexString();
});

OrderSchema.set("toJSON", {
	virtual: true,
});

export const OrdersModel = mongoose.model("orders", OrderSchema);
