import express from "express";
import {
	addToCart,
	getAllProduct,
	getCartProduct,
	getTotal,
} from "../controllers/Cart.js";

const router = express.Router();

router.post("/add/:storeID", addToCart);
router.post("/", getCartProduct);
router.post("/total", getTotal);
router.post("/sample", getAllProduct);

export { router as CartRouter };
