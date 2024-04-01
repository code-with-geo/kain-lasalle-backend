import express from "express";
import {
	createOrder,
	getAllOrders,
	verifyPayment,
} from "../controllers/Orders.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/verify", verifyPayment);
router.post("/", getAllOrders);

export { router as OrdersRoute };
