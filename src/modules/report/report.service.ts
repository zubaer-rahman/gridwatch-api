import { OutageStatus, Priority, type Prisma, Role } from "@prisma/client";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import type { RequestUser } from "../../middlewares/auth.js";
import AppError from "../../utils/AppError.js";
import type {
	ICreateReportPayload,
	IReportFilterRequest,
	IUpdateReportPayload,
} from "./report.interface.js";

const createReport = async (payload: ICreateReportPayload) => {
	const isAreaExists = await prisma.area.findUnique({
		where: { id: payload.areaId, deletedAt: null },
	});

	if (!isAreaExists) {
		throw new AppError(httpStatus.NOT_FOUND, "Associated Area not found");
	}

	// 10.2 Customer Outage Reporting Intelligence:
	// Check for an existing active Outage in that Area
	const activeOutage = await prisma.outage.findFirst({
		where: {
			areaId: payload.areaId,
			deletedAt: null,
			status: {
				notIn: [OutageStatus.RESTORED, OutageStatus.CLOSED],
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return await prisma.$transaction(async (tx) => {
		let outageId = activeOutage?.id;

		// If no active outage exists, create a new Outage incident
		if (!outageId) {
			const newOutage = await tx.outage.create({
				data: {
					areaId: payload.areaId,
					status: OutageStatus.REPORTED,
					priority: payload.isPriority ? Priority.HIGH : Priority.MEDIUM,
					description:
						payload.description || `Outage reported in ${isAreaExists.name}`,
				},
			});
			outageId = newOutage.id;
		}

		return await tx.outageReport.create({
			data: {
				customerId: payload.customerId,
				areaId: payload.areaId,
				outageId,
				description: payload.description,
				isPriority: payload.isPriority ?? false,
			},
			include: {
				customer: {
					select: { id: true, name: true, email: true, contactNumber: true },
				},
				area: {
					select: { id: true, name: true },
				},
				outage: {
					select: { id: true, status: true, priority: true },
				},
			},
		});
	});
};

const getAllReports = async (
	filters: IReportFilterRequest,
	user: RequestUser,
) => {
	const whereConditions: Prisma.OutageReportWhereInput = {
		deletedAt: null,
	};

	// Customer isolation: Customers can only see their own reports
	if (user.role === Role.CUSTOMER) {
		whereConditions.customerId = user.userId;
	}

	if (filters.areaId) {
		whereConditions.areaId = filters.areaId;
	}

	if (filters.outageId) {
		whereConditions.outageId = filters.outageId;
	}

	if (filters.isPriority !== undefined) {
		whereConditions.isPriority = filters.isPriority === "true";
	}

	return await prisma.outageReport.findMany({
		where: whereConditions,
		include: {
			customer: {
				select: { id: true, name: true, email: true, contactNumber: true },
			},
			area: {
				select: { id: true, name: true },
			},
			outage: {
				select: { id: true, status: true, priority: true },
			},
			payment: {
				select: { id: true, amount: true, status: true, transactionId: true },
			},
		},
		orderBy: {
			createdAt: "desc",
		},
	});
};

const getReportById = async (id: string, user: RequestUser) => {
	const report = await prisma.outageReport.findUnique({
		where: { id, deletedAt: null },
		include: {
			customer: {
				select: { id: true, name: true, email: true, contactNumber: true },
			},
			area: {
				select: { id: true, name: true },
			},
			outage: {
				include: {
					assignments: {
						include: {
							operator: {
								select: { id: true, name: true, contactNumber: true },
							},
						},
					},
				},
			},
			payment: true,
		},
	});

	if (!report) {
		throw new AppError(httpStatus.NOT_FOUND, "Report not found");
	}

	// Customer isolation
	if (user.role === Role.CUSTOMER && report.customerId !== user.userId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"You do not have permission to view this report",
		);
	}

	return report;
};

const updateReport = async (id: string, payload: IUpdateReportPayload) => {
	const report = await prisma.outageReport.findUnique({
		where: { id, deletedAt: null },
	});

	if (!report) {
		throw new AppError(httpStatus.NOT_FOUND, "Report not found");
	}

	if (payload.outageId) {
		const isOutageExists = await prisma.outage.findUnique({
			where: { id: payload.outageId, deletedAt: null },
		});
		if (!isOutageExists) {
			throw new AppError(httpStatus.NOT_FOUND, "Associated Outage not found");
		}
	}

	return await prisma.outageReport.update({
		where: { id },
		data: payload,
		include: {
			customer: {
				select: { id: true, name: true, email: true },
			},
			area: {
				select: { id: true, name: true },
			},
			outage: {
				select: { id: true, status: true, priority: true },
			},
		},
	});
};

const deleteReport = async (id: string) => {
	const report = await prisma.outageReport.findUnique({
		where: { id, deletedAt: null },
	});

	if (!report) {
		throw new AppError(httpStatus.NOT_FOUND, "Report not found");
	}

	return await prisma.outageReport.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
};

export const ReportService = {
	createReport,
	getAllReports,
	getReportById,
	updateReport,
	deleteReport,
};
