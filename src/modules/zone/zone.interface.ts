import type { z } from "zod";
import type { ZoneValidation } from "./zone.validation.js";

export type ICreateZonePayload = z.infer<
	typeof ZoneValidation.createZoneSchema
>["body"];
export type IUpdateZonePayload = z.infer<
	typeof ZoneValidation.updateZoneSchema
>["body"];
