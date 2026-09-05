import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { AdminService } from "./admin.service.js";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const result = await AdminService.getAllUsers(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Users retrieved successfully",
		data: result,
	});
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
	const result = await AdminService.updateUserStatus(
		req.params.id as string,
		req.body.isActive as boolean,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "User status updated successfully",
		data: result,
	});
});

const getStatistics = catchAsync(async (_req: Request, res: Response) => {
	const result = await AdminService.getStatistics();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Statistics retrieved successfully",
		data: result,
	});
});

const getAuditLogs = catchAsync(async (req: Request, res: Response) => {
	const result = await AdminService.getAuditLogs(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Audit logs retrieved successfully",
		data: result,
	});
});

export const AdminController = {
	getAllUsers,
	updateUserStatus,
	getStatistics,
	getAuditLogs,
};
