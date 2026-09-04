import { z } from "zod";

const createUserSchema = z.object({
	body: z.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Invalid email format"),
		password: z.string().min(6, "Password must be at least 6 characters"),
		contactNumber: z.string().optional(),
		role: z.enum(["OPERATOR", "ADMIN", "CUSTOMER"]).optional(),
		zoneId: z.string().optional(),
	}),
});

const updateUserSchema = z.object({
	body: z.object({
		role: z.enum(["OPERATOR", "ADMIN", "CUSTOMER"]).optional(),
		zoneId: z.string().min(1, "Zone ID is required").optional(),
		isActive: z.boolean().optional(),
	}),
});

export const UserValidation = {
	createUserSchema,
	updateUserSchema,
};
