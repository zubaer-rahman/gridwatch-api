import { ScheduleStatus } from "@prisma/client";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import type {
	ICreateSchedulePayload,
	IGetAllSchedulesQuery,
	IUpdateSchedulePayload,
} from "./schedule.interface.js";

/**
 * Checks if a time block overlaps with any existing active schedules for an area.
 * Two ranges [start1, end1] and [start2, end2] overlap if:
 * start1 < end2 AND end1 > start2
 */
const checkConflict = async (
	areaId: string,
	startsAt: string | Date,
	endsAt: string | Date,
	excludeScheduleId?: string,
) => {
	const conflictingSchedule = await prisma.schedule.findFirst({
		where: {
			areaId,
			deletedAt: null,
			status: { notIn: [ScheduleStatus.CANCELLED, ScheduleStatus.COMPLETED] },
			id: excludeScheduleId ? { not: excludeScheduleId } : undefined,
			AND: [
				{ startsAt: { lt: new Date(endsAt) } },
				{ endsAt: { gt: new Date(startsAt) } },
			],
		},
	});

	if (conflictingSchedule) {
		throw new AppError(
			httpStatus.CONFLICT,
			`Schedule conflicts with existing schedule (ID: ${conflictingSchedule.id}) from ${conflictingSchedule.startsAt.toISOString()} to ${conflictingSchedule.endsAt.toISOString()}`,
		);
	}
};

const createSchedule = async (payload: ICreateSchedulePayload) => {
	const isAreaExists = await prisma.area.findUnique({
		where: { id: payload.areaId, deletedAt: null },
	});

	if (!isAreaExists) {
		throw new AppError(httpStatus.NOT_FOUND, "Associated Area not found");
	}

	await checkConflict(payload.areaId, payload.startsAt, payload.endsAt);

	return await prisma.schedule.create({
		data: {
			areaId: payload.areaId,
			startsAt: new Date(payload.startsAt),
			endsAt: new Date(payload.endsAt),
			reason: payload.reason,
			status: ScheduleStatus.UPCOMING,
		},
	});
};

const getAllSchedules = async (query: IGetAllSchedulesQuery) => {
	const { areaId, status, startDate, endDate, sortBy, sortOrder } = query;
	const whereConditions: any = { deletedAt: null };

	if (areaId) whereConditions.areaId = areaId;
	if (status) whereConditions.status = status;

	if (startDate || endDate) {
		whereConditions.startsAt = {};
		if (startDate) whereConditions.startsAt.gte = new Date(startDate);
		if (endDate) whereConditions.startsAt.lte = new Date(endDate);
	}

	const orderBy = {
		[sortBy || "startsAt"]: sortOrder || "asc",
	};

	return await prisma.schedule.findMany({
		where: whereConditions,
		orderBy,
		include: {
			area: {
				select: { id: true, name: true },
			},
		},
	});
};

const getScheduleById = async (id: string) => {
	const schedule = await prisma.schedule.findUnique({
		where: { id, deletedAt: null },
		include: {
			area: {
				select: { id: true, name: true },
			},
		},
	});

	if (!schedule) {
		throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
	}

	return schedule;
};

const updateSchedule = async (id: string, payload: IUpdateSchedulePayload) => {
	const schedule = await prisma.schedule.findUnique({
		where: { id, deletedAt: null },
	});

	if (!schedule) {
		throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
	}

	const newStartsAt = payload.startsAt
		? new Date(payload.startsAt)
		: schedule.startsAt;
	const newEndsAt = payload.endsAt ? new Date(payload.endsAt) : schedule.endsAt;

	if (newStartsAt >= newEndsAt) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"startsAt must be before endsAt",
		);
	}

	if (
		(payload.startsAt &&
			new Date(payload.startsAt).getTime() !== schedule.startsAt.getTime()) ||
		(payload.endsAt &&
			new Date(payload.endsAt).getTime() !== schedule.endsAt.getTime())
	) {
		await checkConflict(schedule.areaId, newStartsAt, newEndsAt, id);
	}

	return await prisma.schedule.update({
		where: { id },
		data: {
			...payload,
			startsAt: payload.startsAt ? new Date(payload.startsAt) : undefined,
			endsAt: payload.endsAt ? new Date(payload.endsAt) : undefined,
		},
	});
};

const deleteSchedule = async (id: string) => {
	const schedule = await prisma.schedule.findUnique({
		where: { id, deletedAt: null },
	});

	if (!schedule) {
		throw new AppError(httpStatus.NOT_FOUND, "Schedule not found");
	}

	return await prisma.schedule.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
};

export const ScheduleService = {
	createSchedule,
	getAllSchedules,
	getScheduleById,
	updateSchedule,
	deleteSchedule,
};
