import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import type {
	ICreateFeederPayload,
	IUpdateFeederPayload,
} from "./feeder.interface.js";

const createFeeder = async (payload: ICreateFeederPayload) => {
	const isSubstationExists = await prisma.substation.findUnique({
		where: { id: payload.substationId, deletedAt: null },
	});

	if (!isSubstationExists) {
		throw new AppError(httpStatus.NOT_FOUND, "Associated Substation not found");
	}

	const isFeederExists = await prisma.feeder.findUnique({
		where: { name: payload.name },
	});

	if (isFeederExists) {
		throw new AppError(
			httpStatus.CONFLICT,
			"Feeder with this name already exists",
		);
	}

	return await prisma.feeder.create({
		data: payload,
	});
};

const getAllFeeders = async () => {
	return await prisma.feeder.findMany({
		where: { deletedAt: null },
		include: {
			substation: {
				select: { id: true, name: true },
			},
			_count: {
				select: { areas: true },
			},
		},
	});
};

const getFeederById = async (id: string) => {
	const feeder = await prisma.feeder.findUnique({
		where: { id, deletedAt: null },
		include: {
			substation: {
				select: { id: true, name: true },
			},
			areas: {
				where: { deletedAt: null },
			},
		},
	});

	if (!feeder) {
		throw new AppError(httpStatus.NOT_FOUND, "Feeder not found");
	}

	return feeder;
};

const updateFeeder = async (id: string, payload: IUpdateFeederPayload) => {
	const feeder = await prisma.feeder.findUnique({
		where: { id, deletedAt: null },
	});

	if (!feeder) {
		throw new AppError(httpStatus.NOT_FOUND, "Feeder not found");
	}

	if (payload.substationId) {
		const isSubstationExists = await prisma.substation.findUnique({
			where: { id: payload.substationId, deletedAt: null },
		});
		if (!isSubstationExists) {
			throw new AppError(
				httpStatus.NOT_FOUND,
				"Associated Substation not found",
			);
		}
	}

	if (payload.name) {
		const isNameExists = await prisma.feeder.findFirst({
			where: { name: payload.name, id: { not: id } },
		});
		if (isNameExists) {
			throw new AppError(
				httpStatus.CONFLICT,
				"Feeder with this name already exists",
			);
		}
	}

	return await prisma.feeder.update({
		where: { id },
		data: payload,
	});
};

const deleteFeeder = async (id: string) => {
	const feeder = await prisma.feeder.findUnique({
		where: { id, deletedAt: null },
		include: {
			_count: {
				select: { areas: true },
			},
		},
	});

	if (!feeder) {
		throw new AppError(httpStatus.NOT_FOUND, "Feeder not found");
	}

	if (feeder._count.areas > 0) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Cannot delete feeder with active areas. Reassign or delete them first.",
		);
	}

	return await prisma.feeder.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
};

export const FeederService = {
	createFeeder,
	getAllFeeders,
	getFeederById,
	updateFeeder,
	deleteFeeder,
};
