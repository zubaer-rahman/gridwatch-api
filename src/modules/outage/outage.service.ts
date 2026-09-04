import { OutageStatus } from "@prisma/client";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import type {
	ICreateOutagePayload,
	IUpdateOutagePayload,
} from "./outage.interface.js";

const createOutage = async (payload: ICreateOutagePayload) => {
	const isAreaExists = await prisma.area.findUnique({
		where: { id: payload.areaId, deletedAt: null },
	});

	if (!isAreaExists) {
		throw new AppError(httpStatus.NOT_FOUND, "Associated Area not found");
	}

	return await prisma.outage.create({
		data: payload,
	});
};

const getAllOutages = async () => {
	return await prisma.outage.findMany({
		where: { deletedAt: null },
		include: {
			area: {
				select: {
					id: true,
					name: true,
					feeder: {
						select: {
							id: true,
							name: true,
							substation: {
								select: {
									id: true,
									name: true,
									zone: { select: { id: true, name: true } },
								},
							},
						},
					},
				},
			},
			_count: {
				select: { reports: true, assignments: true },
			},
		},
	});
};

const getOutageById = async (id: string) => {
	const outage = await prisma.outage.findUnique({
		where: { id, deletedAt: null },
		include: {
			area: {
				select: {
					id: true,
					name: true,
					feeder: {
						select: {
							id: true,
							name: true,
							substation: {
								select: {
									id: true,
									name: true,
									zone: { select: { id: true, name: true } },
								},
							},
						},
					},
				},
			},
			reports: {
				where: { deletedAt: null },
			},
			assignments: true,
		},
	});

	if (!outage) {
		throw new AppError(httpStatus.NOT_FOUND, "Outage not found");
	}

	return outage;
};

const updateOutage = async (
	actorId: string,
	id: string,
	payload: IUpdateOutagePayload,
) => {
	const outage = await prisma.outage.findUnique({
		where: { id, deletedAt: null },
	});

	if (!outage) {
		throw new AppError(httpStatus.NOT_FOUND, "Outage not found");
	}

	if (payload.areaId) {
		const isAreaExists = await prisma.area.findUnique({
			where: { id: payload.areaId, deletedAt: null },
		});
		if (!isAreaExists) {
			throw new AppError(httpStatus.NOT_FOUND, "Associated Area not found");
		}
	}

	// State Machine Enforcement
	if (payload.status && payload.status !== outage.status) {
		const validTransitions: Record<OutageStatus, OutageStatus[]> = {
			[OutageStatus.REPORTED]: [
				OutageStatus.ACKNOWLEDGED,
				OutageStatus.ASSIGNED,
			],
			[OutageStatus.ACKNOWLEDGED]: [OutageStatus.ASSIGNED],
			[OutageStatus.ASSIGNED]: [OutageStatus.IN_PROGRESS],
			[OutageStatus.IN_PROGRESS]: [OutageStatus.RESTORED],
			[OutageStatus.RESTORED]: [OutageStatus.CLOSED],
			[OutageStatus.CLOSED]: [],
		};

		if (!validTransitions[outage.status].includes(payload.status)) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Invalid status transition from ${outage.status} to ${payload.status}`,
			);
		}
	}

	if (
		(payload.status === OutageStatus.RESTORED ||
			payload.status === OutageStatus.CLOSED) &&
		!payload.restoredAt
	) {
		payload.restoredAt = new Date().toISOString();
	}

	return await prisma.$transaction(async (tx) => {
		const updatedOutage = await tx.outage.update({
			where: { id },
			data: payload,
		});

		if (payload.status && payload.status !== outage.status) {
			await tx.auditLog.create({
				data: {
					actorId,
					action: "OUTAGE_STATUS_CHANGED",
					entity: "Outage",
					entityId: id,
					previousData: { status: outage.status },
					newData: { status: payload.status },
				},
			});
		}

		return updatedOutage;
	});
};

const deleteOutage = async (id: string) => {
	const outage = await prisma.outage.findUnique({
		where: { id, deletedAt: null },
	});

	if (!outage) {
		throw new AppError(httpStatus.NOT_FOUND, "Outage not found");
	}

	return await prisma.outage.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
};

export const OutageService = {
	createOutage,
	getAllOutages,
	getOutageById,
	updateOutage,
	deleteOutage,
};
