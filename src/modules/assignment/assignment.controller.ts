import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import type { IAssignmentFilterRequest } from "./assignment.interface.js";
import { AssignmentService } from "./assignment.service.js";

const createAssignment = catchAsync(async (req: Request, res: Response) => {
	const actorId = req.user.userId;
	const result = await AssignmentService.createAssignment(req.body, actorId);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: "Operator assigned to outage successfully",
		data: result,
	});
});

const getAllAssignments = catchAsync(async (req: Request, res: Response) => {
	const filters = req.query as IAssignmentFilterRequest;
	const result = await AssignmentService.getAllAssignments(filters, req.user);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Assignments retrieved successfully",
		data: result,
	});
});

const getAssignmentById = catchAsync(async (req: Request, res: Response) => {
	const result = await AssignmentService.getAssignmentById(
		req.params.id as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Assignment retrieved successfully",
		data: result,
	});
});

const deleteAssignment = catchAsync(async (req: Request, res: Response) => {
	const actorId = req.user.userId;
	const result = await AssignmentService.deleteAssignment(
		req.params.id as string,
		actorId,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Assignment removed successfully",
		data: result,
	});
});

export const AssignmentController = {
	createAssignment,
	getAllAssignments,
	getAssignmentById,
	deleteAssignment,
};
