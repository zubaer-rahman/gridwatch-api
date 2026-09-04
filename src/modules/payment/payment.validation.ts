import { z } from "zod";

const initiatePaymentSchema = z.object({
	body: z.object({
		amount: z.number().positive("Amount must be positive"),
		reason: z.string().min(1, "Reason is required"),
		outageReportId: z.string().optional(),
	}),
});

export const PaymentValidation = {
	initiatePaymentSchema,
};
