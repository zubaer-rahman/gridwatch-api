import { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../utils/AppError.js";
import type {
	ICreateUserPayload,
	IUpdateUserPayload,
} from "./user.interface.js";

const createUser = async (payload: ICreateUserPayload) => {
	const email = payload.email.trim().toLowerCase();

	const isUserExists = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExists) {
		throw new AppError(
			httpStatus.CONFLICT,
			"User with this email already exists",
		);
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

	const hashedPassword = await bcrypt.hash(
		payload.password,
		Number(config.bcrypt_salt_rounds || 10),
	);

	return await prisma.user.create({
		data: {
			name: payload.name,
			email,
			password: hashedPassword,
			contactNumber: payload.contactNumber,
			zoneId: payload.zoneId,
			isActive: true,
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			contactNumber: true,
			zoneId: true,
			isActive: true,
			createdAt: true,
			updatedAt: true,
		},
	});
};

const updateUser = async (
	actorId: string,
	id: string,
	payload: IUpdateUserPayload,
) => {
	const user = await prisma.user.findUnique({
		where: { id, deletedAt: null },
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
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

	return await prisma.$transaction(async (tx) => {
		const updatedUser = await tx.user.update({
			where: { id },
			data: payload,
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				zoneId: true,
				isActive: true,
				zone: {
					select: { id: true, name: true },
				},
			},
		});

		if (payload.role && payload.role !== user.role) {
			await tx.auditLog.create({
				data: {
					actorId,
					action: "USER_ROLE_CHANGED",
					entity: "User",
					entityId: id,
					previousData: { role: user.role },
					newData: { role: payload.role },
				},
			});
		}

		return updatedUser;
	});
};

const getAllUsers = async (query: Record<string, unknown>) => {
	const { role } = query;
	const whereConditions: any = { deletedAt: null };

	if (role) {
		whereConditions.role = role as Role;
	}

	return await prisma.user.findMany({
		where: whereConditions,
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			contactNumber: true,
			isActive: true,
			zone: {
				select: { id: true, name: true },
			},
		},
	});
};

export const UserService = {
	createUser,
	updateUser,
	getAllUsers,
};
