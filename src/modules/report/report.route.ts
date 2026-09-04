import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { ReportController } from "./report.controller.js";
import { ReportValidation } from "./report.validation.js";

const router = Router();

router.post(
	"/",
	auth(Role.CUSTOMER, Role.ADMIN),
	validateRequest(ReportValidation.createReportSchema),
	ReportController.createReport,
);

router.get(
	"/",
	auth(Role.ADMIN, Role.OPERATOR, Role.CUSTOMER),
	validateRequest(ReportValidation.getAllReportsQuerySchema),
	ReportController.getAllReports,
);

router.get(
	"/:id",
	auth(Role.ADMIN, Role.OPERATOR, Role.CUSTOMER),
	ReportController.getReportById,
);

router.patch(
	"/:id",
	auth(Role.ADMIN, Role.OPERATOR),
	validateRequest(ReportValidation.updateReportSchema),
	ReportController.updateReport,
);

router.delete("/:id", auth(Role.ADMIN), ReportController.deleteReport);

export const ReportRoutes = router;
