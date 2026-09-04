import type { NextFunction, Request, Response } from "express";
import type { ZodObject } from "zod";
import catchAsync from "../utils/catchAsync.js";

const validateRequest = (schema: ZodObject) => {
	return catchAsync(
		async (req: Request, _res: Response, next: NextFunction) => {
			const parsedData = (await schema.parseAsync({
				body: req.body,
				query: req.query,
				params: req.params,
				cookies: req.cookies,
			})) as Record<string, any>;

			if (parsedData.body) req.body = parsedData.body;
			if (parsedData.cookies) req.cookies = parsedData.cookies;

			if (parsedData.query) {
				Object.defineProperty(req, "query", {
					value: parsedData.query,
					writable: true,
					enumerable: true,
					configurable: true,
				});
			}

			if (parsedData.params) {
				Object.defineProperty(req, "params", {
					value: parsedData.params,
					writable: true,
					enumerable: true,
					configurable: true,
				});
			}

			next();
		},
	);
};

export default validateRequest;
