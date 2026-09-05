import { Redis } from "ioredis";
import config from "../config/index.js";

const redisClient = new Redis(config.redis.url as string, {
	maxRetriesPerRequest: null,
});

redisClient.on("error", (err) => {
	console.error("Redis connection error:", err);
});

redisClient.on("connect", () => {
	console.log("Redis connected successfully");
});

const setOTP = async (email: string, otp: string, expiresInSeconds = 300) => {
	const key = `otp:${email.toLowerCase()}`;
	await redisClient.set(key, otp, "EX", expiresInSeconds);
};

const getOTP = async (email: string) => {
	const key = `otp:${email.toLowerCase()}`;
	return await redisClient.get(key);
};

const deleteOTP = async (email: string) => {
	const key = `otp:${email.toLowerCase()}`;
	await redisClient.del(key);
};

const verifyConnection = async () => {
	await redisClient.ping();
};

export const OTPService = {
	setOTP,
	getOTP,
	deleteOTP,
	redisClient,
	verifyConnection,
};
