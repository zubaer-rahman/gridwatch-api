import { PaymentStatus, Prisma } from "@prisma/client";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import config from "../../config/index.js";
import AppError from "../../utils/AppError.js";
import { getBkashToken, createBkashPayment, executeBkashPayment } from "../../lib/bkash.js";
import type { IInitiatePaymentPayload } from "./payment.interface.js";

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

	const createPayload = {
		mode: "0011",
		payerReference: user.email || "unknown@user.com",
		callbackURL: config.bkash.callback_url,
		amount: payload.amount.toString(),
		currency: "BDT",
		intent: "sale",
		merchantInvoiceNumber: `INV-${Date.now()}`,
	};

	const data = await createBkashPayment(token, createPayload);

	if (data.statusCode !== "0000") {
		throw new AppError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Failed to create bKash payment",
		);
	}

	const payment = await prisma.payment.create({
		data: {
			customerId,
			amount: payload.amount,
			reason: payload.reason,
			outageReportId: payload.outageReportId,
			transactionId: data.paymentID,
			status: PaymentStatus.PENDING,
		},
	});

	return {
		paymentId: payment.id,
		transactionId: payment.transactionId,
		amount: payment.amount,
		status: payment.status,
		bkashURL: data.bkashURL,
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

	const token = await getBkashToken();
	const bkashData = await executeBkashPayment(token, paymentID);

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
