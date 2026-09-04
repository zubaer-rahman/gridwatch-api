import cors from "cors";
import express, {
	type Application,
	type Request,
	type Response,
} from "express";
import helmet from "helmet";

const app: Application = express();

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security
app.use(helmet());
app.use(cors());

// Test Route
app.get("/", (_req: Request, res: Response) => {
	res.send({
		success: true,
		message: "GridWatch API is running...",
		data: {},
	});
});

import notFound from "./middlewares/notFound.js";
import globalErrorHandler from "./middlewares/globalErrorHandler.js";

// TODO: API Routes will be mounted here
// app.use("/api/v1", routes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
