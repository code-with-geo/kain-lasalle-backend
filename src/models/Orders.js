import mongoose, { Schema } from "mongoose";

const formatDate = (date) => {
	const pad = (n) => (n < 10 ? "0" + n : n);
	const month = pad(date.getMonth() + 1); // Months are zero-based
	const day = pad(date.getDate());
	const year = date.getFullYear();
	return `${month}/${day}/${year}`;
};

const OrderSchema = mongoose.Schema({
	orderNumber: { type: Number, require: true },
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
	orderDateTime: { type: String, default: () => formatDate(new Date()) },
	estimatedDateTime: {
		type: Date,
		default: () => new Date(Date.now() + 8 * 60 * 60 * 1000 + 30 * 60 * 1000),
	},
	paymentID: { type: String, require: true },
	paymentUrl: { type: String, require: true },
	paymentReferenceNumber: { type: String, require: true },
	paymentType: { type: String },
	paymentStatus: { type: String, default: "Unpaid" },
	orderStatus: { type: String, default: "Pending" },
});

OrderSchema.virtual("id").get(function () {
	return this._id.toHexString();
});

OrderSchema.set("toJSON", {
	virtual: true,
});

export const OrdersModel = mongoose.model("orders", OrderSchema);
