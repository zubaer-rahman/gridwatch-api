import { ScheduleStatus } from "@prisma/client";
import { z } from "zod";

const scheduleStatusSchema = z
	.enum(["UPCOMING", "ONGOING", "ACTIVE", "COMPLETED", "CANCELLED"])
	.transform((val) =>
		val === "ACTIVE" ? ScheduleStatus.ONGOING : (val as ScheduleStatus),
	);

const createScheduleSchema = z.object({
	body: z
		.object({
			areaId: z.string().min(1, "Area ID is required"),
			startsAt: z.string().datetime(),
			endsAt: z.string().datetime(),
			reason: z.string().optional(),
		})
		.refine((data) => new Date(data.startsAt) < new Date(data.endsAt), {
			message: "startsAt must be before endsAt",
			path: ["endsAt"],
		}),
});

const updateScheduleSchema = z.object({
	body: z
		.object({
			startsAt: z.string().datetime().optional(),
			endsAt: z.string().datetime().optional(),
			status: scheduleStatusSchema.optional(),
			reason: z.string().optional(),
		})
		.refine(
			(data) => {
				if (data.startsAt && data.endsAt) {
					return new Date(data.startsAt) < new Date(data.endsAt);
				}
				return true;
			},
			{
				message: "startsAt must be before endsAt",
				path: ["endsAt"],
			},
		),
});

const getAllSchedulesQuerySchema = z.object({
	query: z.object({
		areaId: z.string().optional(),
		status: scheduleStatusSchema.optional(),
		startDate: z.string().datetime().optional(),
		endDate: z.string().datetime().optional(),
		sortBy: z.enum(["startsAt", "createdAt"]).optional(),
		sortOrder: z.enum(["asc", "desc"]).optional(),
	}),
});

export const ScheduleValidation = {
	createScheduleSchema,
	updateScheduleSchema,
	getAllSchedulesQuerySchema,
};
