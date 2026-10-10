import type { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../config/index.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { PaymentService } from "./payment.service.js";

const initiatePayment = catchAsync(async (req: Request, res: Response) => {
	const result = await PaymentService.initiatePayment(
		req.user.userId,
		req.body,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		message: "Payment initiated successfully",
		data: result,
	});
});

const processCallback = catchAsync(async (req: Request, res: Response) => {
	const paymentID = (req.query.paymentID as string) || "";
	const status = (req.query.status as string) || "";

	await PaymentService.processCallback(paymentID, status);

	const clientUrl = config.client_url || "http://localhost:3000";
	return res.redirect(
		`${clientUrl}/customer/payments/callback?paymentID=${encodeURIComponent(paymentID)}&status=${encodeURIComponent(status)}`,
	);
});

const getAllPayments = catchAsync(async (_req: Request, res: Response) => {
	const result = await PaymentService.getAllPayments();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Payments retrieved successfully",
		data: result,
	});
});

const getPaymentById = catchAsync(async (req: Request, res: Response) => {
	const result = await PaymentService.getPaymentById(
		req.params.id as string,
		req.user.userId,
		req.user.role,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		message: "Payment retrieved successfully",
		data: result,
	});
});

export const PaymentController = {
	initiatePayment,
	processCallback,
	getAllPayments,
	getPaymentById,
};
