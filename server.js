import express from "express";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import mongoose from "mongoose";
import { ProductRouter } from "./src/routes/Products.js";
import { UsersRouter } from "./src/routes/Users.js";
import { VendorsRouter } from "./src/routes/Vendors.js";
import { StoreRouter } from "./src/routes/Stores.js";
import { CartRouter } from "./src/routes/Cart.js";
import { OrdersRoute } from "./src/routes/Orders.js";
app.use(
	cors({
		origin: process.env.CLIENT_URL,
		methods: "GET,POST,PUT,DELETE",
		credentials: true,
	})
);

app.use(express.json());
app.use("/users", UsersRouter);
app.use("/products", ProductRouter);
app.use("/vendors", VendorsRouter);
app.use("/stores", StoreRouter);
app.use("/cart", CartRouter);
app.use("/orders", OrdersRoute);

mongoose.connect(process.env.CONNECTION_STRING);

app.listen(process.env.PORT, () => {
	console.log("Server is running on port: " + process.env.PORT);
});
