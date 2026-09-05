import { z } from "zod";

const registerUserSchema = z.object({
	body: z.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.email({ message: "Invalid email format" }),
		password: z.string().min(6, "Password must be at least 6 characters"),
		contactNumber: z.string().optional(),
	}),
});

const verifyEmailSchema = z.object({
	body: z.object({
		email: z.email({ message: "Invalid email format" }),
		otp: z.string().length(6, "OTP must be exactly 6 characters"),
	}),
});

const loginUserSchema = z.object({
	body: z.object({
		email: z.string().email({ message: "Invalid email format" }),
		password: z.string().min(1, "Password is required"),
	}),
});

const refreshTokenSchema = z.object({
	cookies: z.object({
		refreshToken: z.string().min(1, "Refresh token is required!"),
	}),
});

const googleLoginSchema = z.object({
	body: z.object({
		idToken: z.string().min(1, "Google ID token is required!"),
	}),
});

export const AuthValidation = {
	registerUserSchema,
	verifyEmailSchema,
	loginUserSchema,
	refreshTokenSchema,
	googleLoginSchema,
};
