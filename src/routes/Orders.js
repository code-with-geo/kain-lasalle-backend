import express from "express";
import { createOrder, verifyPayment } from "../controllers/Orders.js";

const router = express.Router();

router.post("/create", createOrder);
router.post("/verify", verifyPayment);

export { router as OrdersRoute };
