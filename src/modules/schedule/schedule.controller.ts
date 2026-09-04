import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { ScheduleService } from "./schedule.service.js";

const createSchedule = catchAsync(async (req: Request, res: Response) => {
	const result = await ScheduleService.createSchedule(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: "Schedule created successfully",
		data: result,
	});
});

const getAllSchedules = catchAsync(async (req: Request, res: Response) => {
	const result = await ScheduleService.getAllSchedules(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Schedules retrieved successfully",
		data: result,
	});
});

const getScheduleById = catchAsync(async (req: Request, res: Response) => {
	const result = await ScheduleService.getScheduleById(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Schedule retrieved successfully",
		data: result,
	});
});

const updateSchedule = catchAsync(async (req: Request, res: Response) => {
	const result = await ScheduleService.updateSchedule(
		req.params.id as string,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Schedule updated successfully",
		data: result,
	});
});

const deleteSchedule = catchAsync(async (req: Request, res: Response) => {
	const result = await ScheduleService.deleteSchedule(req.params.id as string);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Schedule deleted successfully",
		data: result,
	});
});

export const ScheduleController = {
	createSchedule,
	getAllSchedules,
	getScheduleById,
	updateSchedule,
	deleteSchedule,
};
