import type { z } from "zod";
import type { ScheduleValidation } from "./schedule.validation.js";

export type ICreateSchedulePayload = z.infer<
	typeof ScheduleValidation.createScheduleSchema
>["body"];

export type IUpdateSchedulePayload = z.infer<
	typeof ScheduleValidation.updateScheduleSchema
>["body"];

export type IGetAllSchedulesQuery = z.infer<
	typeof ScheduleValidation.getAllSchedulesQuerySchema
>["query"];
