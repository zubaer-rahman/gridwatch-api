import { z } from "zod";

const createAssignmentSchema = z.object({
	body: z.object({
		operatorId: z.string().min(1, "Operator ID is required"),
		outageId: z.string().min(1, "Outage ID is required"),
	}),
});

const getAllAssignmentsQuerySchema = z.object({
	query: z
		.object({
			operatorId: z.string().optional(),
			outageId: z.string().optional(),
		})
		.optional(),
});

export const AssignmentValidation = {
	createAssignmentSchema,
	getAllAssignmentsQuerySchema,
};
