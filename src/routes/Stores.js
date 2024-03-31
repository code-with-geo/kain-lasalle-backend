import express from "express";
import { editStore, getAllStore, getStoreByID } from "../controllers/Stores.js";
import { MulterSetup } from "../helper/Multer.js";

const router = express.Router();

router.post("/edit", MulterSetup.single("file"), editStore);
router.get("/:storeID", getStoreByID);
router.get("/", getAllStore);

export { router as StoreRouter };
