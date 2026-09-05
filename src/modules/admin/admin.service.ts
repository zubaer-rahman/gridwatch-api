import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import type { IAdminUserQuery, IAuditLogQuery } from "./admin.interface.js";
import { PaymentStatus, type Prisma } from "@prisma/client";

const getAllUsers = async (query: IAdminUserQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;

	const andConditions: Prisma.UserWhereInput[] = [];

	if (query.search) {
		andConditions.push({
			OR: [
				{ name: { contains: query.search, mode: "insensitive" } },
				{ email: { contains: query.search, mode: "insensitive" } },
			],
		});
	}

	if (query.status) {
		andConditions.push({ isActive: query.status === "ACTIVE" });
	}

	if (query.role) {
		andConditions.push({ role: query.role });
	}

	const whereConditions: Prisma.UserWhereInput =
		andConditions.length > 0 ? { AND: andConditions } : {};

	const users = await prisma.user.findMany({
		where: whereConditions,
		skip,
		take: limit,
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			isActive: true,
			createdAt: true,
		},
	});

	const total = await prisma.user.count({ where: whereConditions });

	return {
		meta: { page, limit, total },
		data: users,
	};
};

const updateUserStatus = async (id: string, isActive: boolean) => {
	const user = await prisma.user.findUnique({ where: { id } });
	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	if (user.role === "ADMIN") {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Cannot change status of an Admin",
		);
	}

	const updated = await prisma.user.update({
		where: { id },
		data: { isActive },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			isActive: true,
		},
	});

	return updated;
};

const getStatistics = async () => {
	// Aggregate users
	const totalUsers = await prisma.user.count();
	const activeUsers = await prisma.user.count({
		where: { isActive: true },
	});

	// Aggregate Outages
	const totalOutages = await prisma.outage.count();
	const activeOutages = await prisma.outage.count({
		where: { status: { notIn: ["CLOSED", "RESTORED"] } },
	});

	// Aggregate Reports
	const totalReports = await prisma.outageReport.count();
	const priorityReports = await prisma.outageReport.count({
		where: { isPriority: true },
	});

	// Aggregate Payments
	const successfulPayments = await prisma.payment.aggregate({
		where: { status: PaymentStatus.SUCCESS },
		_sum: { amount: true },
	});

	return {
		users: {
			total: totalUsers,
			active: activeUsers,
		},
		outages: {
			total: totalOutages,
			active: activeOutages,
		},
		reports: {
			total: totalReports,
			priority: priorityReports,
			standard: totalReports - priorityReports,
		},
		revenue: {
			total: successfulPayments._sum.amount || 0,
		},
	};
};

const getAuditLogs = async (query: IAuditLogQuery) => {
	const limit = query.limit ? Number(query.limit) : 20;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;

	const andConditions: Prisma.AuditLogWhereInput[] = [];

	if (query.entity) {
		andConditions.push({ entity: query.entity });
	}

	if (query.action) {
		andConditions.push({ action: query.action });
	}

	const whereConditions: Prisma.AuditLogWhereInput =
		andConditions.length > 0 ? { AND: andConditions } : {};

	const logs = await prisma.auditLog.findMany({
		where: whereConditions,
		skip,
		take: limit,
		orderBy: { createdAt: "desc" },
	});

	const total = await prisma.auditLog.count({ where: whereConditions });

	return {
		meta: { page, limit, total },
		data: logs,
	};
};

export const AdminService = {
	getAllUsers,
	updateUserStatus,
	getStatistics,
	getAuditLogs,
};
