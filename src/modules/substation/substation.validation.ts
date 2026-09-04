import { z } from "zod";

const createSubstationSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Substation name cannot be empty"),
		zoneId: z.string(),
	}),
});

const updateSubstationSchema = z.object({
	body: z.object({
		name: z.string().min(1, "Substation name cannot be empty").optional(),
		zoneId: z.string().optional(),
	}),
});

export const SubstationValidation = {
	createSubstationSchema,
	updateSubstationSchema,
};
