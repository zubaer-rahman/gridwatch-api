import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { UserService } from "./user.service.js";

const createUser = catchAsync(async (req: Request, res: Response) => {
	const result = await UserService.createUser(req.body);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: "User created successfully",
		data: result,
	});
});

const updateUser = catchAsync(async (req: Request, res: Response) => {
	const result = await UserService.updateUser(
		req.user.userId,
		req.params.id as string,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "User updated successfully",
		data: result,
	});
});

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
	const { meta, data } = await UserService.getAllUsers(req.query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Users retrieved successfully",
		meta,
		data,
	});
});

const uploadAvatar = catchAsync(async (req: Request, res: Response) => {
	if (!req.file) {
		throw new Error("Please upload a file");
	}

	const result = await UserService.uploadAvatar(req.user.userId, req.file);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Avatar uploaded successfully",
		data: result,
	});
});

export const UserController = {
	createUser,
	updateUser,
	getAllUsers,
	uploadAvatar,
};
