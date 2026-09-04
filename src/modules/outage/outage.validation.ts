import { OutageStatus, Priority } from "@prisma/client";
import { z } from "zod";

const createOutageSchema = z.object({
	body: z.object({
		areaId: z.string(),
		description: z.string().optional(),
		status: z.nativeEnum(OutageStatus).optional(),
		priority: z.nativeEnum(Priority).optional(),
		estimatedRestorationTime: z.string().datetime().optional(),
	}),
});

const updateOutageSchema = z.object({
	body: z.object({
		areaId: z.string().optional(),
		description: z.string().optional(),
		status: z.nativeEnum(OutageStatus).optional(),
		priority: z.nativeEnum(Priority).optional(),
		estimatedRestorationTime: z.string().datetime().optional(),
		restoredAt: z.string().datetime().optional(),
	}),
});

export const OutageValidation = {
	createOutageSchema,
	updateOutageSchema,
};
