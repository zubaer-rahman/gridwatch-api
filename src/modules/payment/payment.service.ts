import { PaymentStatus, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import config from "../../config/index.js";
import AppError from "../../utils/AppError.js";
import { OTPService } from "../../services/redis.service.js";
import type { IInitiatePaymentPayload } from "./payment.interface.js";

const getBkashToken = async () => {
	const IdTokenKey = "bkash_token";
	const RefreshTokenKey = "bkash_refresh_token";

	let bkashIdToken = await OTPService.redisClient.get(IdTokenKey);
	const bkashIdTokenTTL = await OTPService.redisClient.ttl(IdTokenKey);

	const bkashRefreshToken = await OTPService.redisClient.get(RefreshTokenKey);
	const bkashRefreshTokenTTL =
		await OTPService.redisClient.ttl(RefreshTokenKey);

	// If token expires in less than 10 mins, but refresh token is still valid, use refresh strategy
	if (
		(bkashIdTokenTTL <= 600 || !bkashIdToken) &&
		bkashRefreshToken &&
		bkashRefreshTokenTTL > 600
	) {
		const refreshTokenResponse = await fetch(
			`${config.bkash.base_url}/tokenized/checkout/token/refresh`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					username: config.bkash.username as string,
					password: config.bkash.password as string,
				},
				body: JSON.stringify({
					app_key: config.bkash.app_key,
					app_secret: config.bkash.app_secret,
					refresh_token: bkashRefreshToken,
				}),
			},
		);

		if (!refreshTokenResponse.ok) {
			throw new AppError(
				httpStatus.BAD_GATEWAY,
				"Bkash Access Token Refresh Failed",
			);
		}

		const bkashRefreshTokenResult = await refreshTokenResponse.json();
		bkashIdToken = bkashRefreshTokenResult.id_token as string;

		await OTPService.redisClient.set(IdTokenKey, bkashIdToken, "EX", 3600);
		return bkashIdToken;
	}

	// If token is perfectly valid (> 10 mins)
	if (bkashIdTokenTTL > 600 && bkashIdToken) {
		return bkashIdToken;
	}

	// If all else fails, grant a new token
	const response = await fetch(
		`${config.bkash.base_url}/tokenized/checkout/token/grant`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				username: config.bkash.username as string,
				password: config.bkash.password as string,
			},
			body: JSON.stringify({
				app_key: config.bkash.app_key,
				app_secret: config.bkash.app_secret,
			}),
		},
	);

	const data = await response.json();
	if (data.statusCode !== "0000") {
		throw new AppError(
			httpStatus.BAD_GATEWAY,
			"Failed to connect to bKash gateway",
		);
	}

	// Cache the ID token for 1 hour
	await OTPService.redisClient.set(IdTokenKey, data.id_token, "EX", 3600);
	// Cache the refresh token for 28 days
	await OTPService.redisClient.set(
		RefreshTokenKey,
		data.refresh_token,
		"EX",
		60 * 60 * 24 * 28,
	);

	return data.id_token;
};

const initiatePayment = async (
	customerId: string,
	payload: IInitiatePaymentPayload,
) => {
	const user = await prisma.user.findUnique({
		where: { id: customerId },
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "Customer not found");
	}

	if (payload.outageReportId) {
		const report = await prisma.outageReport.findUnique({
			where: { id: payload.outageReportId, deletedAt: null },
		});
		if (!report) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				"Associated Outage Report not found",
			);
		}
	}

	const token = await getBkashToken();

	// Create payment in bKash
	const createPayload = {
		mode: "0011",
		payerReference: user.email || "unknown@user.com", // bKash payerReference has length limits; use email
		callbackURL: config.bkash.callback_url,
		amount: payload.amount.toString(),
		currency: "BDT",
		intent: "sale",
		merchantInvoiceNumber: `INV-${Date.now()}`,
	};

	const response = await fetch(
		`${config.bkash.base_url}/tokenized/checkout/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: token,
				"X-App-Key": config.bkash.app_key as string,
			},
			body: JSON.stringify(createPayload),
		},
	);

	const data = await response.json();

	if (data.statusCode !== "0000") {
		throw new AppError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Failed to create bKash payment",
		);
	}

	// Save to DB
	const payment = await prisma.payment.create({
		data: {
			customerId,
			amount: payload.amount,
			reason: payload.reason,
			outageReportId: payload.outageReportId,
			transactionId: data.paymentID, // Use bKash paymentID as transactionId
			status: PaymentStatus.PENDING,
		},
	});

	return {
		paymentId: payment.id,
		transactionId: payment.transactionId,
		amount: payment.amount,
		status: payment.status,
		bkashURL: data.bkashURL, // Send this back for frontend redirect
	};
};

const processCallback = async (paymentID: string, status: string) => {
	if (!paymentID || !status) {
		throw new AppError(httpStatus.BAD_REQUEST, "Missing callback parameters");
	}

	const payment = await prisma.payment.findUnique({
		where: { transactionId: paymentID },
	});

	if (!payment) {
		throw new AppError(httpStatus.NOT_FOUND, "Transaction not found");
	}

	if (
		payment.status === PaymentStatus.SUCCESS ||
		payment.status === PaymentStatus.FAILED
	) {
		return { message: "Payment already processed", payment };
	}

	if (status !== "success") {
		const updated = await prisma.payment.update({
			where: { id: payment.id },
			data: { status: PaymentStatus.FAILED },
		});
		return { message: "Payment failed or cancelled", payment: updated };
	}

	// If success, verify and execute via bKash API
	const token = await getBkashToken();

	const response = await fetch(
		`${config.bkash.base_url}/tokenized/checkout/execute`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: token,
				"X-App-Key": config.bkash.app_key as string,
			},
			body: JSON.stringify({ paymentID }),
		},
	);

	const bkashData = await response.json();

	if (bkashData.statusCode && bkashData.statusCode !== "0000") {
		const updated = await prisma.payment.update({
			where: { id: payment.id },
			data: {
				status: PaymentStatus.FAILED,
				gatewayData: bkashData as Prisma.InputJsonValue,
			},
		});
		return { message: "Payment verification failed", payment: updated };
	}

	return await prisma.$transaction(async (tx) => {
		const updatedPayment = await tx.payment.update({
			where: { id: payment.id },
			data: {
				status: PaymentStatus.SUCCESS,
				gatewayData: bkashData as Prisma.InputJsonValue,
			},
		});

		if (payment.outageReportId) {
			await tx.outageReport.update({
				where: { id: payment.outageReportId },
				data: { isPriority: true },
			});
		}

		await tx.auditLog.create({
			data: {
				actorId: payment.customerId,
				action: "PAYMENT_VERIFIED",
				entity: "Payment",
				entityId: payment.id,
				previousData: { status: payment.status },
				newData: { status: PaymentStatus.SUCCESS },
			},
		});

		return {
			message: "Payment processed successfully",
			payment: updatedPayment,
		};
	});
};

const getAllPayments = async () => {
	return await prisma.payment.findMany({
		include: {
			customer: {
				select: { id: true, name: true, email: true },
			},
			outageReport: {
				select: { id: true, isPriority: true },
			},
		},
		orderBy: { createdAt: "desc" },
	});
};

const getPaymentById = async (id: string, userId: string, role: string) => {
	const payment = await prisma.payment.findUnique({
		where: { id },
		include: {
			customer: {
				select: { id: true, name: true, email: true },
			},
			outageReport: {
				select: { id: true, isPriority: true },
			},
		},
	});

	if (!payment) {
		throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
	}

	if (role === "CUSTOMER" && payment.customerId !== userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You are not authorized to view this payment",
		);
	}

	return payment;
};

export const PaymentService = {
	initiatePayment,
	processCallback,
	getAllPayments,
	getPaymentById,
};
