import cookieParser from "cookie-parser";
import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import helmet from "helmet";

const app: Application = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

import rateLimit from "express-rate-limit";

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: process.env.NODE_ENV === "production" ? 100 : 10000,
	skip: () => process.env.NODE_ENV !== "production",
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message:
			"Too many requests from this IP, please try again after 15 minutes",
		errorSources: [],
	},
});

app.use(
	helmet({
		crossOriginResourcePolicy: { policy: "cross-origin" },
	}),
);
app.use(
	cors({
		origin: true,
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"X-Requested-With",
			"Accept",
			"Origin",
		],
	}),
);
app.use(limiter);

app.get("/", (_req: Request, res: Response) => {
	res.send({
		success: true,
		message: "GridWatch API is running...",
		data: {},
	});
});

import globalErrorHandler from "./middlewares/globalErrorHandler.js";
import notFound from "./middlewares/notFound.js";

import router from "./routes/index.js";

app.use("/api/v1", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
