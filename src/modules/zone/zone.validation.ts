import { z } from "zod";

const createZoneSchema = z.object({
	body: z.object({
		name: z.string({ message: "Zone name is required" }),
		description: z.string().optional(),
	}),
});

const updateZoneSchema = z.object({
	body: z.object({
		name: z.string().optional(),
		description: z.string().optional(),
	}),
});

export const ZoneValidation = {
	createZoneSchema,
	updateZoneSchema,
};
