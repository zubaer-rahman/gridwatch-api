import type { z } from "zod";
import type { ReportValidation } from "./report.validation.js";

export type ICreateReportPayload = z.infer<
	typeof ReportValidation.createReportSchema
>["body"] & { customerId: string };

export type IUpdateReportPayload = z.infer<
	typeof ReportValidation.updateReportSchema
>["body"];

export type IReportFilterRequest = {
	areaId?: string;
	outageId?: string;
	isPriority?: string;
};
