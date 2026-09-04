import type { z } from "zod";
import type { AreaValidation } from "./area.validation.js";

export type ICreateAreaPayload = z.infer<
	typeof AreaValidation.createAreaSchema
>["body"];
export type IUpdateAreaPayload = z.infer<
	typeof AreaValidation.updateAreaSchema
>["body"];
