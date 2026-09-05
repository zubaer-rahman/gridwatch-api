import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { NotificationService } from "./notification.service.js";

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
	const result = await NotificationService.getMyNotifications(
		req.user.userId,
		req.query,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Notifications retrieved successfully",
		data: result,
	});
});

const markAsRead = catchAsync(async (req: Request, res: Response) => {
	const result = await NotificationService.markAsRead(
		req.params.id as string,
		req.user.userId,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Notification marked as read",
		data: result,
	});
});

export const NotificationController = {
	getMyNotifications,
	markAsRead,
};
