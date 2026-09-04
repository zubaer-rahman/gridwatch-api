import type { Role } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config/index.js";
import { prisma } from "../lib/prisma.js";
import AppError from "../utils/AppError.js";
import catchAsync from "../utils/catchAsync.js";

export interface RequestUser {
	userId: string;
	role: Role;
	email: string;
}

declare global {
	namespace Express {
		interface Request {
			user: RequestUser;
		}
	}
}

const auth = (...requiredRoles: Role[]) => {
	return catchAsync(
		async (req: Request, _res: Response, next: NextFunction) => {
			// 1. Token Extraction
			const token =
				(req.headers.authorization?.startsWith("Bearer ")
					? req.headers.authorization.split(" ")[1]
					: req.headers.authorization) || req.cookies?.accessToken;

			if (!token) {
				throw new AppError(
					httpStatus.UNAUTHORIZED,
					"You are not authorized! Access token is missing.",
				);
			}

			// 2. JWT Verification
			let decoded: JwtPayload;
			try {
				decoded = jwt.verify(token, config.jwt.secret as string) as JwtPayload;
			} catch (_err) {
				throw new AppError(
					httpStatus.UNAUTHORIZED,
					"Invalid or expired token!",
				);
			}

			const { userId, role, email } = decoded;

			// 3. Database Validation (Ensures user wasn't deleted/blocked after token was issued)
			const user = await prisma.user.findUnique({
				where: { id: userId, email },
			});

			if (!user) {
				throw new AppError(
					httpStatus.UNAUTHORIZED,
					"This user no longer exists in the system.",
				);
			}

			// Checking our specific GridWatch User schema fields
			if (!user.isActive || user.deletedAt) {
				throw new AppError(
					httpStatus.FORBIDDEN,
					"This account is disabled or deleted.",
				);
			}

			// 4. Role Authorization
			if (requiredRoles.length && !requiredRoles.includes(role as Role)) {
				throw new AppError(
					httpStatus.FORBIDDEN,
					"You do not have the required permissions to access this route!",
				);
			}

			// 5. Inject authenticated user payload into the Request object
			req.user = {
				userId: user.id,
				role: user.role,
				email: user.email,
			};

			next();
		},
	);
};

export default auth;
