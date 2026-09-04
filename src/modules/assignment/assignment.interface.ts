import type { z } from "zod";
import type { AssignmentValidation } from "./assignment.validation.js";

export type ICreateAssignmentPayload = z.infer<
	typeof AssignmentValidation.createAssignmentSchema
>["body"];

export type IAssignmentFilterRequest = {
	operatorId?: string;
	outageId?: string;
};
