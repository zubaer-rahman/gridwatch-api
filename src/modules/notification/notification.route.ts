import express from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { NotificationController } from "./notification.controller.js";
import { NotificationValidation } from "./notification.validation.js";

const router = express.Router();

router.get("/", auth(), NotificationController.getMyNotifications);

router.patch(
	"/:id/read",
	auth(),
	validateRequest(NotificationValidation.markAsReadSchema),
	NotificationController.markAsRead,
);

export const NotificationRoutes = router;
