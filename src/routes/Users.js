import express from "express";
import {
	forgotPassword,
	getUserByID,
	login,
	resetPassword,
	signUp,
	verifyEmail,
} from "../controllers/Users.js";

const router = express.Router();

router.post("/signup", signUp);
router.get("/:id/verify/:token", verifyEmail);
router.post("/login", login);
router.post("/forgot", forgotPassword);
router.post("/:id/reset/:token", resetPassword);
router.post("/", getUserByID);
router.get("/:userID", getUserByID);

export { router as UsersRouter };
