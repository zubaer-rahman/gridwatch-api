import { z } from "zod";

const createReportSchema = z.object({
	body: z.object({
		areaId: z.string().min(1, "Area ID is required"),
		description: z.string().optional(),
		isPriority: z.boolean().optional(),
	}),
});

const updateReportSchema = z.object({
	body: z.object({
		outageId: z.string().optional(),
		description: z.string().optional(),
		isPriority: z.boolean().optional(),
	}),
});

const getAllReportsQuerySchema = z.object({
	query: z
		.object({
			areaId: z.string().optional(),
			outageId: z.string().optional(),
			isPriority: z.enum(["true", "false"]).optional(),
		})
		.optional(),
});

export const ReportValidation = {
	createReportSchema,
	updateReportSchema,
	getAllReportsQuerySchema,
};
