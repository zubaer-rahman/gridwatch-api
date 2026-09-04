import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { AreaService } from "./area.service.js";

const createArea = catchAsync(async (req: Request, res: Response) => {
	const result = await AreaService.createArea(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: "Area created successfully",
		data: result,
	});
});

const getAllAreas = catchAsync(async (req: Request, res: Response) => {
	const result = await AreaService.getAllAreas();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Areas retrieved successfully",
		data: result,
	});
});

const getAreaById = catchAsync(async (req: Request, res: Response) => {
	const result = await AreaService.getAreaById(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Area retrieved successfully",
		data: result,
	});
});

const updateArea = catchAsync(async (req: Request, res: Response) => {
	const result = await AreaService.updateArea(
		req.params.id as string,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Area updated successfully",
		data: result,
	});
});

const deleteArea = catchAsync(async (req: Request, res: Response) => {
	const result = await AreaService.deleteArea(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Area deleted successfully",
		data: result,
	});
});

export const AreaController = {
	createArea,
	getAllAreas,
	getAreaById,
	updateArea,
	deleteArea,
};
