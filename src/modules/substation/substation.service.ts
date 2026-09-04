import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import type {
	ICreateSubstationPayload,
	IUpdateSubstationPayload,
} from "./substation.interface.js";

const createSubstation = async (payload: ICreateSubstationPayload) => {
	const isZoneExists = await prisma.distributionZone.findUnique({
		where: { id: payload.zoneId, deletedAt: null },
	});

	if (!isZoneExists) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Associated Distribution Zone not found",
		);
	}

	const isSubstationExists = await prisma.substation.findUnique({
		where: { name: payload.name },
	});

	if (isSubstationExists) {
		throw new AppError(
			httpStatus.CONFLICT,
			"Substation with this name already exists",
		);
	}

	return await prisma.substation.create({
		data: payload,
	});
};

const getAllSubstations = async () => {
	return await prisma.substation.findMany({
		where: { deletedAt: null },
		include: {
			zone: {
				select: { id: true, name: true },
			},
			_count: {
				select: { feeders: true },
			},
		},
	});
};

const getSubstationById = async (id: string) => {
	const substation = await prisma.substation.findUnique({
		where: { id, deletedAt: null },
		include: {
			zone: {
				select: { id: true, name: true, description: true },
			},
			feeders: {
				where: { deletedAt: null },
			},
		},
	});

	if (!substation) {
		throw new AppError(httpStatus.NOT_FOUND, "Substation not found");
	}

	return substation;
};

const updateSubstation = async (
	id: string,
	payload: IUpdateSubstationPayload,
) => {
	const substation = await prisma.substation.findUnique({
		where: { id, deletedAt: null },
	});

	if (!substation) {
		throw new AppError(httpStatus.NOT_FOUND, "Substation not found");
	}

	if (payload.zoneId) {
		const isZoneExists = await prisma.distributionZone.findUnique({
			where: { id: payload.zoneId, deletedAt: null },
		});
		if (!isZoneExists) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				"Associated Distribution Zone not found",
			);
		}
	}

	if (payload.name) {
		const isNameExists = await prisma.substation.findFirst({
			where: { name: payload.name, id: { not: id } },
		});
		if (isNameExists) {
			throw new AppError(
				httpStatus.CONFLICT,
				"Substation with this name already exists",
			);
		}
	}

	return await prisma.substation.update({
		where: { id },
		data: payload,
	});
};

const deleteSubstation = async (id: string) => {
	const substation = await prisma.substation.findUnique({
		where: { id, deletedAt: null },
		include: {
			_count: {
				select: { feeders: true },
			},
		},
	});

	if (!substation) {
		throw new AppError(httpStatus.NOT_FOUND, "Substation not found");
	}

	if (substation._count.feeders > 0) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Cannot delete substation with active feeders. Reassign or delete them first.",
		);
	}

	return await prisma.substation.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
};

export const SubstationService = {
	createSubstation,
	getAllSubstations,
	getSubstationById,
	updateSubstation,
	deleteSubstation,
};
