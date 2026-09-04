import { z } from "zod";

const createFeederSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Feeder name cannot be empty"),
		substationId: z.string(),
	}),
});

const updateFeederSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Feeder name cannot be empty").optional(),
		substationId: z.string().optional(),
	}),
});

export const FeederValidation = {
	createFeederSchema,
	updateFeederSchema,
};
