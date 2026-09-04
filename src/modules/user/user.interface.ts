import type { z } from "zod";
import type { UserValidation } from "./user.validation.js";

export type ICreateUserPayload = z.infer<
	typeof UserValidation.createUserSchema
>["body"];

export type IUpdateUserPayload = z.infer<
	typeof UserValidation.updateUserSchema
>["body"];
