import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";
import errorHandler from "./middleware/error.middleware.js";
import router from "./routes/index.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api", apiLimiter);
app.use("/api", router);

app.use(errorHandler);
export default app;
