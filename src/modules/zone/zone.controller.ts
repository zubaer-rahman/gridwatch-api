import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { ZoneService } from "./zone.service.js";

const createZone = catchAsync(async (req: Request, res: Response) => {
	const result = await ZoneService.createZone(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: "Distribution Zone created successfully",
		data: result,
	});
});

const getAllZones = catchAsync(async (req: Request, res: Response) => {
	const result = await ZoneService.getAllZones();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Distribution Zones retrieved successfully",
		data: result,
	});
});

const getZoneById = catchAsync(async (req: Request, res: Response) => {
	const result = await ZoneService.getZoneById(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Distribution Zone retrieved successfully",
		data: result,
	});
});

const updateZone = catchAsync(async (req: Request, res: Response) => {
	const result = await ZoneService.updateZone(
		req.params.id as string,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Distribution Zone updated successfully",
		data: result,
	});
});

const deleteZone = catchAsync(async (req: Request, res: Response) => {
	const result = await ZoneService.deleteZone(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Distribution Zone deleted successfully",
		data: result,
	});
});

export const ZoneController = {
	createZone,
	getAllZones,
	getZoneById,
	updateZone,
	deleteZone,
};
