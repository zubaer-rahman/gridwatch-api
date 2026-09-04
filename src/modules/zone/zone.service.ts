import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import type { ICreateZonePayload, IUpdateZonePayload } from "./zone.interface.js";

const createZone = async (payload: ICreateZonePayload) => {
	const isZoneExists = await prisma.distributionZone.findUnique({
		where: { name: payload.name },
	});

	if (isZoneExists) {
		throw new AppError(httpStatus.CONFLICT, "Zone with this name already exists");
	}

	return await prisma.distributionZone.create({
		data: payload,
	});
};

const getAllZones = async () => {
	return await prisma.distributionZone.findMany({
		where: { deletedAt: null },
		include: {
			_count: {
				select: { substations: true, operators: true },
			},
		},
	});
};

const getZoneById = async (id: string) => {
	const zone = await prisma.distributionZone.findUnique({
		where: { id, deletedAt: null },
		include: {
			substations: {
				where: { deletedAt: null },
			},
			operators: {
				select: { id: true, name: true, email: true, contactNumber: true },
			},
		},
	});

	if (!zone) {
		throw new AppError(httpStatus.NOT_FOUND, "Zone not found");
	}

	return zone;
};

const updateZone = async (id: string, payload: IUpdateZonePayload) => {
	const zone = await prisma.distributionZone.findUnique({
		where: { id, deletedAt: null },
	});

	if (!zone) {
		throw new AppError(httpStatus.NOT_FOUND, "Zone not found");
	}

	if (payload.name) {
		const isNameExists = await prisma.distributionZone.findFirst({
			where: { name: payload.name, id: { not: id } },
		});

		if (isNameExists) {
			throw new AppError(httpStatus.CONFLICT, "Zone with this name already exists");
		}
	}

	return await prisma.distributionZone.update({
		where: { id },
		data: payload,
	});
};

const deleteZone = async (id: string) => {
	const zone = await prisma.distributionZone.findUnique({
		where: { id, deletedAt: null },
		include: {
			_count: {
				select: { substations: true },
			},
		},
	});

	if (!zone) {
		throw new AppError(httpStatus.NOT_FOUND, "Zone not found");
	}

	if (zone._count.substations > 0) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Cannot delete zone with active substations. Reassign or delete them first.",
		);
	}

	return await prisma.distributionZone.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
};

export const ZoneService = {
	createZone,
	getAllZones,
	getZoneById,
	updateZone,
	deleteZone,
};
