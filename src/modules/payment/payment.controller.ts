import type { Request, Response } from "express";
import httpStatus from "http-status";
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
	const _result = await PaymentService.processCallback(
		req.query.paymentID as string,
		req.query.status as string,
	);

	let htmlContent = "";
	if (req.query.status === "success") {
		htmlContent = `
			<html>
				<head><title>Payment Successful</title></head>
				<body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
					<h1 style="color: green;">Payment Successful!</h1>
					<p>Your transaction has been verified. Priority Outage Report enabled.</p>
					<button onclick="window.close()" style="padding: 10px 20px; font-size: 16px;">Close Window</button>
				</body>
			</html>
		`;
	} else {
		htmlContent = `
			<html>
				<head><title>Payment Failed</title></head>
				<body style="font-family: sans-serif; text-align: center; margin-top: 50px;">
					<h1 style="color: red;">Payment Failed or Cancelled</h1>
					<p>Unfortunately, your payment could not be processed.</p>
					<button onclick="window.close()" style="padding: 10px 20px; font-size: 16px;">Close Window</button>
				</body>
			</html>
		`;
	}

	res.send(htmlContent);
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
