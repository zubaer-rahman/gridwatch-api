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
	limit: 100, // Limit each IP to 100 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		success: false,
		message: "Too many requests from this IP, please try again after 15 minutes",
		errorSources: [],
	},
});

app.use(helmet());
app.use(cors());
app.use(limiter);

app.get("/", (_req: Request, res: Response) => {
	res.send({
		success: true,
		message: "GridWatch API is running...",
		data: {},
	});
});

import notFound from "./middlewares/notFound.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";

import router from "./routes/index.js";

app.use("/api/v1", router);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
