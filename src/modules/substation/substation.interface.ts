import type { z } from "zod";
import type { SubstationValidation } from "./substation.validation.js";

export type ICreateSubstationPayload = z.infer<
	typeof SubstationValidation.createSubstationSchema
>["body"];
export type IUpdateSubstationPayload = z.infer<
	typeof SubstationValidation.updateSubstationSchema
>["body"];
