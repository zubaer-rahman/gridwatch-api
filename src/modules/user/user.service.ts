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
	const { role, isActive, searchTerm, sortBy, sortOrder, page, limit } = query;
	const whereConditions: any = { deletedAt: null };

	if (role) {
		whereConditions.role = role as Role;
	}
	
	if (isActive !== undefined) {
		whereConditions.isActive = isActive === 'true';
	}

	if (searchTerm) {
		whereConditions.OR = [
			{ name: { contains: searchTerm as string, mode: "insensitive" } },
			{ email: { contains: searchTerm as string, mode: "insensitive" } },
			{ contactNumber: { contains: searchTerm as string, mode: "insensitive" } }
		];
	}

	const pageNumber = Number(page) || 1;
	const limitNumber = Number(limit) || 10;
	const skip = (pageNumber - 1) * limitNumber;

	const orderBy: any = {};
	if (sortBy) {
		orderBy[sortBy as string] = sortOrder === 'desc' ? 'desc' : 'asc';
	} else {
		orderBy['createdAt'] = 'desc';
	}

	const users = await prisma.user.findMany({
		where: whereConditions,
		skip,
		take: limitNumber,
		orderBy,
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

	const total = await prisma.user.count({ where: whereConditions });

	return {
		meta: {
			page: pageNumber,
			limit: limitNumber,
			total,
			totalPages: Math.ceil(total / limitNumber),
		},
		data: users,
	};
};

import { uploadToCloudinary } from "../../lib/cloudinary.js";

const uploadAvatar = async (id: string, file: Express.Multer.File) => {
	const user = await prisma.user.findUnique({
		where: { id, deletedAt: null },
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	const result = await uploadToCloudinary(
		file.buffer,
		"gridwatch-avatars",
		`avatar-${id}-${Date.now()}`,
	);

	return await prisma.user.update({
		where: { id },
		data: { avatar: result.secure_url },
		select: {
			id: true,
			name: true,
			email: true,
			avatar: true,
		},
	});
};

export const UserService = {
	createUser,
	updateUser,
	getAllUsers,
	uploadAvatar,
};
