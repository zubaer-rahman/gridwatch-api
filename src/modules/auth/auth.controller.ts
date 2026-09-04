import type { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../config/index.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { AuthService } from "./auth.service.js";

const registerUser = catchAsync(async (req: Request, res: Response) => {
	const result = await AuthService.registerUser(req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "OTP sent to your email. Please verify to complete registration.",
		data: result,
	});
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
	await AuthService.verifyEmail(req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Email verified successfully",
		data: null,
	});
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const { accessToken, refreshToken } = await AuthService.loginUser(req.body);

	res.cookie("refreshToken", refreshToken, {
		secure: config.env === "production",
		httpOnly: true,
	});

	res.cookie("accessToken", accessToken, {
		secure: config.env === "production",
		httpOnly: true,
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "User logged in successfully",
		data: {
			accessToken,
		},
	});
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
	const currentRefreshToken = req.cookies.refreshToken;

	const result = await AuthService.refreshToken(currentRefreshToken);

	res.cookie("accessToken", result.accessToken, {
		secure: config.env === "production",
		httpOnly: true,
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Access token is retrieved successfully",
		data: result,
	});
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
	const token = req.cookies.refreshToken;

	if (token) {
		await AuthService.logoutUser(token);
	}

	res.clearCookie("refreshToken", {
		secure: config.env === "production",
		httpOnly: true,
	});

	res.clearCookie("accessToken", {
		secure: config.env === "production",
		httpOnly: true,
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "User logged out successfully",
		data: null,
	});
});

export const AuthController = {
	registerUser,
	verifyEmail,
	loginUser,
	refreshToken,
	logoutUser,
};
