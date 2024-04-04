import express from "express";
import {
	addStore,
	editStore,
	getAllStore,
	getStoreByID,
} from "../controllers/Stores.js";
import { MulterSetup } from "../helper/Multer.js";

const router = express.Router();

router.post("/edit", MulterSetup.single("file"), editStore);
router.post("/", getStoreByID);
router.post("/add", MulterSetup.single("file"), addStore);
router.get("/", getAllStore);

export { router as StoreRouter };
