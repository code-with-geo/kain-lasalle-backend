import { UsersModel } from "../models/Users.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import EmailSender from "../helper/EmailSender.js";
import {
	VerificationTokenModel,
	ResetPassTokenModel,
} from "../models/Tokens.js";

export const signUp = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		let user = await UsersModel.findOne({ email });
		if (user) {
			return res.json({
				responsecode: "402",
				message: "This email is already registered.",
			});
		}
		user = await new UsersModel({ name, email, password }).save();
		const token = await new VerificationTokenModel({
			userID: user._id,
			token: jwt.sign({ id: user._id }, process.env.SECRET_KEY),
		}).save();

		const emailURL = `${process.env.CLIENT_URL}/${user._id}/verify/${token.token}`;
		await EmailSender(
			user.email,
			"Email Verification",
			`Hi there, \n You have set ${user.email} as your registered email. Please click the link to verify your email: ` +
				emailURL
		);
		return res.json({
			responsecode: "200",
			message: "Successfully registered.",
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const verifyEmail = async (req, res) => {
	try {
		let userID = "";
		let user = await UsersModel.findOne({ _id: req.params.id });
		if (!user)
			return res.json({ message: "Invalid link.", responsecode: "402" });

		let token = await VerificationTokenModel.findOne({
			userID: user._id,
			token: req.params.token,
		});

		if (!token)
			return res.json({ message: "Invalid link.", responsecode: "402" });
		userID = user._id;
		user = await UsersModel.updateOne(
			{ _id: user._id },
			{ $set: { verified: true } }
		);

		await VerificationTokenModel.deleteMany({ userID: userID });

		res.json({ message: "Email successfully verified.", responsecode: "200" });
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			message: "Please contact technical support.",
			responsecode: "500",
		});
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;
		let user = await UsersModel.findOne({ email });

		if (!user) {
			return res.json({
				message: "This user is not registered.",
				responsecode: "402",
			});
		}

		user = await UsersModel.findOne({ email, password });

		if (!user) {
			return res.json({
				message: "Incorrect email or password. Please try again.",
				responsecode: "402",
			});
		}

		user = await UsersModel.findOne({ email, password, verified: true });

		if (!user) {
			return res.json({
				message: "This email is not verified",
				responsecode: "402",
			});
		}

		const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY);
		res.json({
			responsecode: "200",
			message: "Successfully Login!",
			token,
			userID: user._id,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;
		let user = await UsersModel.findOne({ email });

		if (!user) {
			return res.json({
				responsecode: "402",
				message: "This email is not registered.",
			});
		}

		let checkToken = await ResetPassTokenModel.findOne({ userID: user._id });
		if (checkToken) {
			return res.json({
				responsecode: "402",
				message: "Please check your email.",
			});
		}

		const token = await new ResetPassTokenModel({
			userID: user._id,
			token: jwt.sign({ id: user._id }, process.env.SECRET_KEY),
		}).save();

		const emailURL = `${process.env.CLIENT_URL}/${user._id}/reset/${token.token}`;
		await EmailSender(
			user.email,
			"Reset Password",
			`Hi there, \n We've received your request to reset your password. Please click the link to verify your email: ` +
				emailURL
		);
		return res.json({
			responsecode: "200",
			message: "Reset password request sent.",
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const resetPassword = async (req, res) => {
	try {
		const { password } = req.body;

		const user = await UsersModel.findOne({ _id: req.params.id });
		if (!user)
			return res.json({ responsecode: "402", message: "Invalid link." });

		const token = await ResetPassTokenModel.findOne({
			userID: user._id,
			token: req.params.token,
		});

		if (!token)
			return res.json({ responsecode: "402", message: "Invalid link." });

		await UsersModel.updateOne(
			{
				_id: user._id,
			},
			{ $set: { password } }
		);
		await ResetPassTokenModel.deleteMany({ userID: user._id });

		res.json({
			responsecode: "200",
			message: "Password successfully changed.",
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const getUserByID = async (req, res) => {
	try {
		const user = await UsersModel.findOne({ _id: req.params.userID });
		if (!user)
			return res.json({
				responsecode: "402",
				message: "This user is not registered.",
			});

		res.json({
			responsecode: "200",
			user: user,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const EditProfile = async (req, res) => {
	try {
		const { userID, name, email } = req.body;
		let user = await UsersModel.findOne({ _id: userID });

		if (!user)
			return res.json({
				responsecode: "402",
				message: "This user is not registered.",
			});

		user = await UsersModel.findOne({ _id: userID });
		if (user) {
			user = await UsersModel.updateOne(
				{
					_id: user._id,
				},
				{ $set: { name, email, verified: false } }
			);

			user = await UsersModel.findOne({ _id: userID });

			const token = await new VerificationTokenModel({
				userID: user._id,
				token: jwt.sign({ id: user._id }, process.env.SECRET_KEY),
			}).save();

			const emailURL = `${process.env.CLIENT_URL}/${user._id}/verify/${token.token}`;
			await EmailSender(
				user.email,
				"Email Verification",
				`Hi there, \n You have set ${user.email} as your registered email. Please click the link to verify your email: ` +
					emailURL
			);

			return res.json({
				responsecode: "200",
				message: "Successfully Updated",
			});
		}
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};
