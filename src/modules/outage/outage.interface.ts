import type { z } from "zod";
import type { OutageValidation } from "./outage.validation.js";

export type ICreateOutagePayload = z.infer<
	typeof OutageValidation.createOutageSchema
>["body"];
export type IUpdateOutagePayload = z.infer<
	typeof OutageValidation.updateOutageSchema
>["body"];
