import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { ZodError } from "zod";
import config from "../config/index.js";
import AppError from "../utils/AppError.js";

// Define the standard error structure specified in implementation.md
type TErrorSource = {
	path: string | number;
	message: string;
};

const globalErrorHandler = (
	err: any,
	_req: Request,
	res: Response,
	_next: NextFunction,
) => {
	let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
	let message = "Something went wrong";
	let errors: TErrorSource[] = [
		{
			path: "",
			message: "Internal Server Error",
		},
	];

	// 1. Zod Validation Error (Advanced catching that the reference missed)
	if (err instanceof ZodError) {
		statusCode = httpStatus.BAD_REQUEST;
		message = "Validation Error";
		errors = err.issues.map((issue) => ({
			path:
				issue.path[issue.path.length - 1] !== undefined
					? String(issue.path[issue.path.length - 1])
					: "",
			message: issue.message,
		}));
	}
	// 2. Prisma Known Request Errors
	else if (err instanceof Prisma.PrismaClientKnownRequestError) {
		if (err.code === "P2002") {
			statusCode = httpStatus.CONFLICT;
			message = "Duplicate Entry";
			errors = [
				{
					path: "",
					message: `${err.meta?.target} already exists.`,
				},
			];
		} else if (err.code === "P2003") {
			statusCode = httpStatus.BAD_REQUEST;
			message = "Foreign Key Constraint Failed";
			errors = [
				{
					path: "",
					message: "The requested operation violates a relational constraint.",
				},
			];
		} else if (err.code === "P2025") {
			statusCode = httpStatus.NOT_FOUND;
			message = "Not Found";
			errors = [
				{
					path: "",
					message: "The requested record was not found.",
				},
			];
		}
	}
	// 3. Prisma Validation Error
	else if (err instanceof Prisma.PrismaClientValidationError) {
		statusCode = httpStatus.BAD_REQUEST;
		message = "Validation Error";
		errors = [
			{
				path: "",
				message: "Invalid data types or missing fields in database query.",
			},
		];
	}
	// 4. Custom Operational Errors
	else if (err instanceof AppError) {
		statusCode = err.statusCode;
		message = err.message;
		errors = [
			{
				path: "",
				message: err.message,
			},
		];
	}
	// 5. Generic Node Errors
	else if (err instanceof Error) {
		message = err.message;
		errors = [
			{
				path: "",
				message: err.message,
			},
		];
	}

	// Send the exact structure defined in implementation.md
	res.status(statusCode).json({
		success: false,
		message,
		errors,
		...(config.env === "development" && { stack: err.stack }),
	});
};

export default globalErrorHandler;
