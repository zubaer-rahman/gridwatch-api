import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import type { IReportFilterRequest } from "./report.interface.js";
import { ReportService } from "./report.service.js";

const createReport = catchAsync(async (req: Request, res: Response) => {
	const customerId = req.user.userId;
	const payload = { ...req.body, customerId };

	const result = await ReportService.createReport(payload);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: "Report submitted successfully",
		data: result,
	});
});

const getAllReports = catchAsync(async (req: Request, res: Response) => {
	const filters = req.query as IReportFilterRequest;
	const result = await ReportService.getAllReports(filters, req.user);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Reports retrieved successfully",
		data: result,
	});
});

const getReportById = catchAsync(async (req: Request, res: Response) => {
	const result = await ReportService.getReportById(
		req.params.id as string,
		req.user,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Report retrieved successfully",
		data: result,
	});
});

const updateReport = catchAsync(async (req: Request, res: Response) => {
	const result = await ReportService.updateReport(
		req.params.id as string,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Report updated successfully",
		data: result,
	});
});

const deleteReport = catchAsync(async (req: Request, res: Response) => {
	const result = await ReportService.deleteReport(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Report deleted successfully",
		data: result,
	});
});

export const ReportController = {
	createReport,
	getAllReports,
	getReportById,
	updateReport,
	deleteReport,
};
