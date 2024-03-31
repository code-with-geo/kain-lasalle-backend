import { ProductModel } from "../models/Products.js";
import { storage } from "../database/Firebase.js";
import {
	ref,
	uploadBytesResumable,
	getDownloadURL,
	deleteObject,
} from "firebase/storage";

export const addProduct = async (req, res) => {
	try {
		const { storeID, sku, name, description, price, units } = req.body;

		let store = await ProductModel.findOne({ storeID, sku });
		if (store) {
			return res.json({
				responsecode: "402",
				message: "Please enter different SKU.",
			});
		}

		const storageRef = ref(storage, "products/" + req.file.originalname);
		const metadata = { contentType: req.file.mimetype };
		const snapshot = await uploadBytesResumable(
			storageRef,
			req.file.buffer,
			metadata
		);

		const downloadURL = await getDownloadURL(snapshot.ref);

		let product = await new ProductModel({
			storeID,
			sku,
			name,
			description,
			image: downloadURL,
			price,
			units,
		}).save();

		return res.json({
			responsecode: "200",
			message: "Product is successfully added.",
			products: product,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const deleteProduct = async (req, res) => {
	try {
		const { productID } = req.body;

		let product = await ProductModel.findOne({ _id: productID });
		const desertRef = ref(storage, product.image);

		deleteObject(desertRef)
			.then(async () => {
				await ProductModel.deleteOne({ _id: productID });

				return res.json({
					responsecode: "200",
					message: "Product is successfully deleted.",
				});
			})
			.catch((error) => {
				console.log(error);
				return res.status(500).send({
					responsecode: "500",
					message: "Please contact technical support.",
				});
			});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const getAllProducts = async (req, res) => {
	try {
		let products = await ProductModel.find({ storeID: req.params.storeID });

		return res.json({
			responsecode: "200",
			products: products,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const getProductByID = async (req, res) => {
	try {
		const { productID } = req.body;
		let product = await ProductModel.findOne({
			_id: productID,
		});

		return res.json({
			responsecode: "200",
			products: product,
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};

export const updateProduct = async (req, res) => {
	try {
		const { productID, sku, name, description, price, units } = req.body;

		let product = await ProductModel.findOne({ _id: productID });
		if (!product) {
			return res.json({
				responsecode: "402",
				message: "Product not found.",
			});
		}

		let fileName = "";
		if (req.file != null) {
			fileName = req.file.originalname;
			const desertRef = ref(storage, product.image);
			deleteObject(desertRef);
		} else {
			fileName = product.image;
		}

		if (product.sku != sku) {
			let skuChecker = await ProductModel.findOne({ sku });
			if (skuChecker) {
				return res.json({
					responsecode: "402",
					message: "Please enter different SKU.",
				});
			}
		}

		if (product.image != fileName) {
			const storageRef = ref(storage, "products/" + req.file.originalname);
			const metadata = { contentType: req.file.mimetype };
			const snapshot = await uploadBytesResumable(
				storageRef,
				req.file.buffer,
				metadata
			);

			const downloadURL = await getDownloadURL(snapshot.ref);

			await ProductModel.updateOne(
				{ _id: productID },
				{ $set: { sku, name, description, image: downloadURL, price, units } }
			);
		} else {
			await ProductModel.updateOne(
				{ _id: productID },
				{ $set: { sku, name, description, image: fileName, price, units } }
			);
		}

		return res.json({
			responsecode: "200",
			message: "Product is successfully updated.",
		});
	} catch (err) {
		console.log(err);
		return res.status(500).send({
			responsecode: "500",
			message: "Please contact technical support.",
		});
	}
};
