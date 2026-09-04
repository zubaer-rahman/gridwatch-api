import type { z } from "zod";
import type { AuthValidation } from "./auth.validation.js";

export type IRegisterUserPayload = z.infer<
	typeof AuthValidation.registerUserSchema
>["body"];

export type IVerifyEmailPayload = z.infer<
	typeof AuthValidation.verifyEmailSchema
>["body"];

export type ILoginUserPayload = z.infer<
	typeof AuthValidation.loginUserSchema
>["body"];

export type IRefreshTokenPayload = z.infer<
	typeof AuthValidation.refreshTokenSchema
>["cookies"];
