import type { z } from "zod";
import type { PaymentValidation } from "./payment.validation.js";

export type IInitiatePaymentPayload = z.infer<
	typeof PaymentValidation.initiatePaymentSchema
>["body"];
