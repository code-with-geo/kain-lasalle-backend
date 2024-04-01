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
		default: Date.now,
		get: (orderDateTime) => orderDateTime.toLocaleDateString("en-US"), // getter
	},
	paymentID: { type: String, require: true },
	paymentUrl: { type: String, require: true },
	paymentReferenceNumber: { type: String, require: true },
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
