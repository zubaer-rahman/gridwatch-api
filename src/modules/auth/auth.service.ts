import crypto from "node:crypto";
import bcrypt from "bcrypt";
import httpStatus from "http-status";
import config from "../../config/index.js";
import { prisma } from "../../lib/prisma.js";
import { OTPService } from "../../lib/redis.js";
import { EmailService } from "../../services/email.service.js";
import AppError from "../../utils/AppError.js";
import { jwtUtils } from "../../utils/jwt.js";
import type {
	ILoginUserPayload,
	IRegisterUserPayload,
	IVerifyEmailPayload,
} from "./auth.interface.js";

const registerUser = async (payload: IRegisterUserPayload) => {
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

	const hashedPassword = await bcrypt.hash(
		payload.password,
		Number(config.bcrypt_salt_rounds || 10),
	);

	const expirationMinutes = 5;
	const expirationSeconds = expirationMinutes * 60;

	// Store user registration data in Redis temporarily
	const registrationKey = `registration-data:${email}`;
	const redisUserDataPayload = {
		name: payload.name,
		email,
		password: hashedPassword,
		contactNumber: payload.contactNumber,
	};

	await OTPService.redisClient.set(
		registrationKey,
		JSON.stringify(redisUserDataPayload),
		"EX",
		expirationSeconds,
	);

	// Generate and Store OTP
	const otp = crypto.randomInt(100000, 1000000).toString();

	await OTPService.setOTP(email, otp, expirationSeconds);

	// Send Email
	await EmailService.sendRegistrationOTP(
		email,
		payload.name,
		otp,
		expirationMinutes,
	);

	return { email };
};

const verifyEmail = async (payload: IVerifyEmailPayload) => {
	const email = payload.email.trim().toLowerCase();
	const otp = payload.otp;

	const isUserExist = await prisma.user.findUnique({
		where: { email },
	});

	if (isUserExist) {
		throw new AppError(
			httpStatus.CONFLICT,
			"User is already verified and active",
		);
	}

	const storedOTP = await OTPService.getOTP(email);

	if (!storedOTP) {
		throw new AppError(httpStatus.BAD_REQUEST, "OTP expired or invalid");
	}

	if (storedOTP !== otp) {
		throw new AppError(httpStatus.BAD_REQUEST, "OTP does not match");
	}

	const registrationKey = `registration-data:${email}`;
	const redisUserData = await OTPService.redisClient.get(registrationKey);

	if (!redisUserData) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Registration session expired. Please register again.",
		);
	}

	const userPayload = JSON.parse(redisUserData);

	// Activate User by saving to Database
	const createdUser = await prisma.user.create({
		data: {
			name: userPayload.name,
			email: userPayload.email,
			password: userPayload.password,
			contactNumber: userPayload.contactNumber,
			isActive: true,
		},
	});

	await OTPService.deleteOTP(email);
	await OTPService.redisClient.del(registrationKey);

	await EmailService.sendWelcomeEmail(email, createdUser.name);

	return null;
};

const loginUser = async (payload: ILoginUserPayload) => {
	const email = payload.email.trim().toLowerCase();

	const user = await prisma.user.findUnique({
		where: { email },
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	if (user.provider !== "LOCAL") {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Please login using your ${user.provider} account`,
		);
	}

	if (user.deletedAt) {
		throw new AppError(httpStatus.FORBIDDEN, "This account has been deleted");
	}

	if (!user.isActive) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Please verify your email before logging in",
		);
	}

	const isPasswordMatched = await bcrypt.compare(
		payload.password,
		user.password,
	);

	if (!isPasswordMatched) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
	}

	const jwtPayload = {
		userId: user.id,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt.secret as string,
		config.jwt.expires_in as string,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt.refresh_secret as string,
		config.jwt.refresh_expires_in as string,
	);

	// Determine expiration date (defaulting to 30 days if standard format isn't strictly numeric)
	// For production, parse the config string accurately.
	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

	await prisma.refreshToken.create({
		data: {
			token: refreshToken,
			userId: user.id,
			expiresAt,
		},
	});

	return {
		accessToken,
		refreshToken,
	};
};

const refreshToken = async (token: string) => {
	const verified = jwtUtils.verifyToken(
		token,
		config.jwt.refresh_secret as string,
	) as Record<string, any>;

	const dbToken = await prisma.refreshToken.findUnique({
		where: { token },
	});

	if (!dbToken) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid refresh token");
	}

	const user = await prisma.user.findUnique({
		where: { id: verified.userId },
	});

	if (!user || user.deletedAt || !user.isActive) {
		throw new AppError(httpStatus.UNAUTHORIZED, "User is invalid or inactive");
	}

	const jwtPayload = {
		userId: user.id,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt.secret as string,
		config.jwt.expires_in as string,
	);

	return {
		accessToken,
	};
};

const logoutUser = async (token: string) => {
	await prisma.refreshToken.deleteMany({
		where: { token },
	});
	return null;
};

import { verifyGoogleToken } from "../../lib/googleAuth.js";

const googleLogin = async (payload: { idToken: string }) => {
	const payloadData = await verifyGoogleToken(payload.idToken);
	if (!payloadData?.email) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid Google token");
	}

	const email = payloadData.email.trim().toLowerCase();
	let user = await prisma.user.findUnique({
		where: { email },
	});

	if (user) {
		if (user.deletedAt) {
			throw new AppError(httpStatus.FORBIDDEN, "This account has been deleted");
		}
		if (!user.isActive) {
			// Auto-verify since Google guarantees email ownership
			user = await prisma.user.update({
				where: { id: user.id },
				data: { isActive: true },
			});
			await OTPService.deleteOTP(email);
			await OTPService.redisClient.del(`registration-data:${email}`);
		}
	} else {
		// Generate random password for Google signup
		const crypto = await import("node:crypto");
		const randomPassword = crypto.randomBytes(16).toString("hex");
		const hashedPassword = await bcrypt.hash(
			randomPassword,
			Number(config.bcrypt_salt_rounds || 10),
		);

		user = await prisma.user.create({
			data: {
				name: payloadData.name || "Google User",
				email,
				password: hashedPassword,
				provider: "GOOGLE",
				contactNumber: null,
				isActive: true, // Google email is inherently verified
				avatar: payloadData.picture,
				role: "CUSTOMER",
			},
		});
	}

	const jwtPayload = {
		userId: user.id,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt.secret as string,
		config.jwt.expires_in as string,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		config.jwt.refresh_secret as string,
		config.jwt.refresh_expires_in as string,
	);

	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

	await prisma.refreshToken.create({
		data: {
			token: refreshToken,
			userId: user.id,
			expiresAt,
		},
	});

	return {
		accessToken,
		refreshToken,
	};
};

export const AuthService = {
	registerUser,
	verifyEmail,
	loginUser,
	refreshToken,
	logoutUser,
	googleLogin,
};
