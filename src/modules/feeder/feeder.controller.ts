import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { FeederService } from "./feeder.service.js";

const createFeeder = catchAsync(async (req: Request, res: Response) => {
	const result = await FeederService.createFeeder(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: "Feeder created successfully",
		data: result,
	});
});

const getAllFeeders = catchAsync(async (_req: Request, res: Response) => {
	const result = await FeederService.getAllFeeders();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Feeders retrieved successfully",
		data: result,
	});
});

const getFeederById = catchAsync(async (req: Request, res: Response) => {
	const result = await FeederService.getFeederById(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Feeder retrieved successfully",
		data: result,
	});
});

const updateFeeder = catchAsync(async (req: Request, res: Response) => {
	const result = await FeederService.updateFeeder(
		req.params.id as string,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Feeder updated successfully",
		data: result,
	});
});

const deleteFeeder = catchAsync(async (req: Request, res: Response) => {
	const result = await FeederService.deleteFeeder(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Feeder deleted successfully",
		data: result,
	});
});

export const FeederController = {
	createFeeder,
	getAllFeeders,
	getFeederById,
	updateFeeder,
	deleteFeeder,
};
