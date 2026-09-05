import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { PaymentController } from "./payment.controller.js";
import { PaymentValidation } from "./payment.validation.js";

const router = Router();

router.post(
	"/initiate",
	auth(Role.CUSTOMER, Role.ADMIN),
	validateRequest(PaymentValidation.initiatePaymentSchema),
	PaymentController.initiatePayment,
);

// This is public for the bKash redirect
router.get("/callback", PaymentController.processCallback);

router.get("/", auth(Role.ADMIN), PaymentController.getAllPayments);

router.get(
	"/:id",
	auth(Role.CUSTOMER, Role.ADMIN),
	PaymentController.getPaymentById,
);

export const PaymentRoutes = router;
