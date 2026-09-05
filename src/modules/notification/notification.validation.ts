import { z } from "zod";

const markAsReadSchema = z.object({
	params: z.object({
		id: z.string().uuid("Invalid Notification ID"),
	}),
});

export const NotificationValidation = {
	markAsReadSchema,
};
