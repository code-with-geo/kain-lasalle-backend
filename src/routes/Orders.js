import express from "express";
import {
	completeOrder,
	createOrder,
	getCancelledOrdeCount,
	getAllOrders,
	getAllPendingOrder,
	getAllUnpaidOrder,
	getOrderItemByID,
	getOrdersByOrderID,
	getOrdersByStoreID,
	getOrdersCount,
	getSoldOutProducts,
	verifyPayment,
	NotifyCustomer,
	tagOrderAsPaid,
	orderCancellation,
	getTodaysSale,
	getYesterdaySale,
} from "../controllers/Orders.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/verify", verifyPayment);
router.post("/", getAllOrders);
router.post("/get-by-order-id", getOrdersByOrderID);
router.post("/get-by-id", getOrdersByStoreID);
router.post("/get-products", getOrderItemByID);
router.post("/complete", completeOrder);
router.post("/pending", getAllPendingOrder);
router.post("/count", getOrdersCount);
router.post("/unpaid", getAllUnpaidOrder);
router.post("/soldout", getSoldOutProducts);
router.post("/cancelled", getCancelledOrdeCount);
router.post("/notify", NotifyCustomer);
router.post("/tag-as-paid", tagOrderAsPaid);
router.post("/cancellation", orderCancellation);
router.post("/today-sale", getTodaysSale);
router.post("/yesterday-sale", getYesterdaySale);

export { router as OrdersRoute };
