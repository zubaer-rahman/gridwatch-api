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

app.use(helmet());
app.use(cors());

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
