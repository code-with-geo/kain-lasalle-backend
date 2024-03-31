import express from "express";
import {
	addVendor,
	forgotPassword,
	resetPassword,
	verifyEmail,
	login,
	getVendorByID,
	updateVendor,
} from "../controllers/Vendors.js";

const router = express.Router();

router.post("/add/", addVendor);
router.get("/:id/verify/:token", verifyEmail);
router.post("/login", login);
router.post("/forgot", forgotPassword);
router.post("/:id/reset/:token", resetPassword);
router.get("/get-by-id/:vendorID", getVendorByID);
router.post("/edit/:vendorID", updateVendor);

export { router as VendorsRouter };
