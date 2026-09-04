import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { ScheduleController } from "./schedule.controller.js";
import { ScheduleValidation } from "./schedule.validation.js";

const router = Router();

router.post(
	"/",
	auth(Role.ADMIN),
	validateRequest(ScheduleValidation.createScheduleSchema),
	ScheduleController.createSchedule,
);

router.get(
	"/",
	auth(Role.ADMIN, Role.OPERATOR, Role.CUSTOMER),
	validateRequest(ScheduleValidation.getAllSchedulesQuerySchema),
	ScheduleController.getAllSchedules,
);

router.get(
	"/:id",
	auth(Role.ADMIN, Role.OPERATOR, Role.CUSTOMER),
	ScheduleController.getScheduleById,
);

router.patch(
	"/:id",
	auth(Role.ADMIN, Role.OPERATOR),
	validateRequest(ScheduleValidation.updateScheduleSchema),
	ScheduleController.updateSchedule,
);

router.delete("/:id", auth(Role.ADMIN), ScheduleController.deleteSchedule);

export const ScheduleRoutes = router;
