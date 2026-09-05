import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import type { INotificationQuery } from "./notification.interface.js";
import type { Prisma } from "@prisma/client";

const getMyNotifications = async (userId: string, query: INotificationQuery) => {
	const limit = query.limit ? Number(query.limit) : 10;
	const page = query.page ? Number(query.page) : 1;
	const skip = (page - 1) * limit;

	const andConditions: Prisma.NotificationWhereInput[] = [{ userId }];

	if (query.isRead !== undefined) {
		andConditions.push({
			isRead: query.isRead,
		});
	}

	const whereConditions: Prisma.NotificationWhereInput =
		andConditions.length > 0 ? { AND: andConditions } : {};

	const result = await prisma.notification.findMany({
		where: whereConditions,
		skip,
		take: limit,
		orderBy: { createdAt: "desc" },
	});

	const total = await prisma.notification.count({
		where: whereConditions,
	});

	return {
		meta: {
			page,
			limit,
			total,
		},
		data: result,
	};
};

const markAsRead = async (id: string, userId: string) => {
	const notification = await prisma.notification.findUnique({
		where: { id },
	});

	if (!notification) {
		throw new AppError(httpStatus.NOT_FOUND, "Notification not found");
	}

	if (notification.userId !== userId) {
		throw new AppError(httpStatus.FORBIDDEN, "You do not own this notification");
	}

	const result = await prisma.notification.update({
		where: { id },
		data: { isRead: true },
	});

	return result;
};

export const NotificationService = {
	getMyNotifications,
	markAsRead,
};
