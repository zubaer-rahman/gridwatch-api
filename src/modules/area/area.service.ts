import httpStatus from "http-status";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import type {
	ICreateAreaPayload,
	IUpdateAreaPayload,
} from "./area.interface.js";

const createArea = async (payload: ICreateAreaPayload) => {
	const isFeederExists = await prisma.feeder.findUnique({
		where: { id: payload.feederId, deletedAt: null },
	});

	if (!isFeederExists) {
		throw new AppError(httpStatus.NOT_FOUND, "Associated Feeder not found");
	}

	return await prisma.area.create({
		data: payload,
	});
};

const getAllAreas = async () => {
	return await prisma.area.findMany({
		where: { deletedAt: null },
		include: {
			feeder: {
				select: { id: true, name: true },
			},
			_count: {
				select: { outages: true, reports: true, schedules: true },
			},
		},
	});
};

const getAreaById = async (id: string) => {
	const area = await prisma.area.findUnique({
		where: { id, deletedAt: null },
		include: {
			feeder: {
				select: { id: true, name: true },
			},
			schedules: {
				where: { deletedAt: null },
			},
		},
	});

	if (!area) {
		throw new AppError(httpStatus.NOT_FOUND, "Area not found");
	}

	return area;
};

const updateArea = async (id: string, payload: IUpdateAreaPayload) => {
	const area = await prisma.area.findUnique({
		where: { id, deletedAt: null },
	});

	if (!area) {
		throw new AppError(httpStatus.NOT_FOUND, "Area not found");
	}

	if (payload.feederId) {
		const isFeederExists = await prisma.feeder.findUnique({
			where: { id: payload.feederId, deletedAt: null },
		});
		if (!isFeederExists) {
			throw new AppError(httpStatus.NOT_FOUND, "Associated Feeder not found");
		}
	}

	return await prisma.area.update({
		where: { id },
		data: payload,
	});
};

const deleteArea = async (id: string) => {
	const area = await prisma.area.findUnique({
		where: { id, deletedAt: null },
		include: {
			_count: {
				select: { outages: true, schedules: true },
			},
		},
	});

	if (!area) {
		throw new AppError(httpStatus.NOT_FOUND, "Area not found");
	}

	if (area._count.outages > 0 || area._count.schedules > 0) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Cannot delete area with active outages or schedules. Resolve them first.",
		);
	}

	return await prisma.area.update({
		where: { id },
		data: { deletedAt: new Date() },
	});
};

export const AreaService = {
	createArea,
	getAllAreas,
	getAreaById,
	updateArea,
	deleteArea,
};
