import { z } from "zod";

const updateUserStatusSchema = z.object({
	params: z.object({
		id: z.string().uuid("Invalid User ID"),
	}),
	body: z.object({
		isActive: z.boolean(),
	}),
});

export const AdminValidation = {
	updateUserStatusSchema,
};
