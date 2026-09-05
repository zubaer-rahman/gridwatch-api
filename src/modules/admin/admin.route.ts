import express from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { AdminController } from "./admin.controller.js";
import { AdminValidation } from "./admin.validation.js";

const router = express.Router();

router.get("/users", auth("ADMIN"), AdminController.getAllUsers);

router.patch(
	"/users/:id/status",
	auth("ADMIN"),
	validateRequest(AdminValidation.updateUserStatusSchema),
	AdminController.updateUserStatus,
);

router.get("/statistics", auth("ADMIN"), AdminController.getStatistics);

router.get("/audit-logs", auth("ADMIN"), AdminController.getAuditLogs);

export const AdminRoutes = router;
