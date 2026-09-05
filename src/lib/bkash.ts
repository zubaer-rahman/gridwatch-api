import httpStatus from "http-status";
import config from "../config/index.js";
import { OTPService } from "./redis.js";
import AppError from "../utils/AppError.js";

export const getBkashToken = async () => {
	const IdTokenKey = "bkash_token";
	const RefreshTokenKey = "bkash_refresh_token";

	let bkashIdToken = await OTPService.redisClient.get(IdTokenKey);
	const bkashIdTokenTTL = await OTPService.redisClient.ttl(IdTokenKey);

	const bkashRefreshToken = await OTPService.redisClient.get(RefreshTokenKey);
	const bkashRefreshTokenTTL =
		await OTPService.redisClient.ttl(RefreshTokenKey);

	if (
		(bkashIdTokenTTL <= 600 || !bkashIdToken) &&
		bkashRefreshToken &&
		bkashRefreshTokenTTL > 600
	) {
		const refreshTokenResponse = await fetch(
			`${config.bkash.base_url}/tokenized/checkout/token/refresh`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					username: config.bkash.username as string,
					password: config.bkash.password as string,
				},
				body: JSON.stringify({
					app_key: config.bkash.app_key,
					app_secret: config.bkash.app_secret,
					refresh_token: bkashRefreshToken,
				}),
			},
		);

		if (!refreshTokenResponse.ok) {
			throw new AppError(
				httpStatus.BAD_GATEWAY,
				"Bkash Access Token Refresh Failed",
			);
		}

		const bkashRefreshTokenResult = await refreshTokenResponse.json();
		bkashIdToken = bkashRefreshTokenResult.id_token as string;

		await OTPService.redisClient.set(IdTokenKey, bkashIdToken, "EX", 3600);
		return bkashIdToken;
	}

	if (bkashIdTokenTTL > 600 && bkashIdToken) {
		return bkashIdToken;
	}

	const response = await fetch(
		`${config.bkash.base_url}/tokenized/checkout/token/grant`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				username: config.bkash.username as string,
				password: config.bkash.password as string,
			},
			body: JSON.stringify({
				app_key: config.bkash.app_key,
				app_secret: config.bkash.app_secret,
			}),
		},
	);

	const data = await response.json();
	if (data.statusCode !== "0000") {
		throw new AppError(
			httpStatus.BAD_GATEWAY,
			"Failed to connect to bKash gateway",
		);
	}

	await OTPService.redisClient.set(IdTokenKey, data.id_token, "EX", 3600);
	await OTPService.redisClient.set(
		RefreshTokenKey,
		data.refresh_token,
		"EX",
		60 * 60 * 24 * 28,
	);

	return data.id_token;
};

export const createBkashPayment = async (token: string, payload: any) => {
	const response = await fetch(
		`${config.bkash.base_url}/tokenized/checkout/create`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: token,
				"X-App-Key": config.bkash.app_key as string,
			},
			body: JSON.stringify(payload),
		},
	);
	return await response.json();
};

export const executeBkashPayment = async (token: string, paymentID: string) => {
	const response = await fetch(
		`${config.bkash.base_url}/tokenized/checkout/execute`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Accept: "application/json",
				Authorization: token,
				"X-App-Key": config.bkash.app_key as string,
			},
			body: JSON.stringify({ paymentID }),
		},
	);
	return await response.json();
};
