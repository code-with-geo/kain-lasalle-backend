import express from "express";
import {
	addProduct,
	deleteProduct,
	getAllProducts,
	getProductByID,
	updateProduct,
} from "../controllers/Products.js";
import { MulterSetup } from "../helper/Multer.js";

const router = express.Router();

router.get("/:storeID", getAllProducts);
router.post("/get-by-id", getProductByID);
router.post("/add", MulterSetup.single("file"), addProduct);
router.post("/delete", deleteProduct);
router.post("/edit", MulterSetup.single("file"), updateProduct);
export { router as ProductRouter };
