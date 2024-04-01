import express from "express";
import {
	addToCart,
	getCartCount,
	getCartProduct,
	removeFromCart,
} from "../controllers/Cart.js";

const router = express.Router();

router.post("/add/:storeID", addToCart);
router.post("/", getCartProduct);
router.post("/count", getCartCount);
router.post("/remove", removeFromCart);

export { router as CartRouter };
