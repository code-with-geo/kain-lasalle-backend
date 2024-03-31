import { StoreModel } from "../models/Stores.js";
import { storage } from "../database/Firebase.js";
import {
	ref,
	uploadBytesResumable,
	getDownloadURL,
	deleteObject,
} from "firebase/storage";

export const editStore = async (req, res) => {
	try {
		const { storeID, name, description } = req.body;

		let store = await StoreModel.findOne({ _id: storeID });

		if (!store) {
			return res.json({
				responsecode: "402",
				message: "Store not found.",
			});
		}

		let fileName = "";
		if (req.file != null) {
			fileName = req.file.originalname;
			const desertRef = ref(storage, store.image);
			deleteObject(desertRef);
		} else {
			fileName = store.image;
		}

		if (store.name != name) {
			let checker = await StoreModel.findOne({ name });
			if (checker) {
				return res.json({
					responsecode: "402",
					message: "Please enter different store name.",
				});
			}
		}

		if (store.image != fileName) {
			const storageRef = ref(storage, "stores/" + req.file.originalname);
			const metadata = { contentType: req.file.mimetype };
			const snapshot = await uploadBytesResumable(
				storageRef,
				req.file.buffer,
				metadata
			);

			const downloadURL = await getDownloadURL(snapshot.ref);

			await StoreModel.updateOne(
				{ _id: storeID },
				{ $set: { name, description, image: downloadURL } }
			);
		} else {
			await StoreModel.updateOne(
				{ _id: storeID },
				{ $set: { name, description, image: fileName } }
			);
		}

		return res.json({
			responsecode: "200",
			message: "Store is successfully updated.",
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const getStoreByID = async (req, res) => {
	try {
		let store = await StoreModel.findOne({ _id: req.params.storeID });

		if (!store) {
			return res.json({
				responsecode: "402",
				message: "Store not found.",
			});
		}

		return res.json({
			responsecode: "200",
			store: store,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const getAllStore = async (req, res) => {
	try {
		let store = await StoreModel.find({});

		if (!store) {
			return res.status(500).send({
				responsecode: "500",
				message: "Please contact technical support.",
			});
		}

		return res.json({
			responsecode: "200",
			store: store,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};
