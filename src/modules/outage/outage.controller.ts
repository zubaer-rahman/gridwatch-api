import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { OutageService } from "./outage.service.js";

const createOutage = catchAsync(async (req: Request, res: Response) => {
	const result = await OutageService.createOutage(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: "Outage created successfully",
		data: result,
	});
});

const getAllOutages = catchAsync(async (req: Request, res: Response) => {
	const result = await OutageService.getAllOutages();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Outages retrieved successfully",
		data: result,
	});
});

const getOutageById = catchAsync(async (req: Request, res: Response) => {
	const result = await OutageService.getOutageById(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Outage retrieved successfully",
		data: result,
	});
});

const updateOutage = catchAsync(async (req: Request, res: Response) => {
	const result = await OutageService.updateOutage(
		req.user.userId,
		req.params.id as string,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Outage updated successfully",
		data: result,
	});
});

const deleteOutage = catchAsync(async (req: Request, res: Response) => {
	const result = await OutageService.deleteOutage(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Outage deleted successfully",
		data: result,
	});
});

export const OutageController = {
	createOutage,
	getAllOutages,
	getOutageById,
	updateOutage,
	deleteOutage,
};
