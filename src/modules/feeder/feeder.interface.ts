import type { z } from "zod";
import type { FeederValidation } from "./feeder.validation.js";

export type ICreateFeederPayload = z.infer<
	typeof FeederValidation.createFeederSchema
>["body"];
export type IUpdateFeederPayload = z.infer<
	typeof FeederValidation.updateFeederSchema
>["body"];
