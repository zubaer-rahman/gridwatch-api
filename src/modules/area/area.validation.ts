import { z } from "zod";

const createAreaSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Area name cannot be empty"),
		feederId: z.string(),
	}),
});

const updateAreaSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Area name cannot be empty").optional(),
		feederId: z.string().optional(),
	}),
});

export const AreaValidation = {
	createAreaSchema,
	updateAreaSchema,
};
