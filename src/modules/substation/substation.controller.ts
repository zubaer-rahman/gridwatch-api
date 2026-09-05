import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { SubstationService } from "./substation.service.js";

const createSubstation = catchAsync(async (req: Request, res: Response) => {
	const result = await SubstationService.createSubstation(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: "Substation created successfully",
		data: result,
	});
});

const getAllSubstations = catchAsync(async (_req: Request, res: Response) => {
	const result = await SubstationService.getAllSubstations();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Substations retrieved successfully",
		data: result,
	});
});

const getSubstationById = catchAsync(async (req: Request, res: Response) => {
	const result = await SubstationService.getSubstationById(
		req.params.id as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Substation retrieved successfully",
		data: result,
	});
});

const updateSubstation = catchAsync(async (req: Request, res: Response) => {
	const result = await SubstationService.updateSubstation(
		req.params.id as string,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Substation updated successfully",
		data: result,
	});
});

const deleteSubstation = catchAsync(async (req: Request, res: Response) => {
	const result = await SubstationService.deleteSubstation(
		req.params.id as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Substation deleted successfully",
		data: result,
	});
});

export const SubstationController = {
	createSubstation,
	getAllSubstations,
	getSubstationById,
	updateSubstation,
	deleteSubstation,
};
