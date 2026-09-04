import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { OutageController } from "./outage.controller.js";
import { OutageValidation } from "./outage.validation.js";

const router = Router();

router.post(
	"/",
	auth(Role.ADMIN, Role.OPERATOR),
	validateRequest(OutageValidation.createOutageSchema),
	OutageController.createOutage,
);

router.get(
	"/",
	auth(Role.ADMIN, Role.OPERATOR, Role.CUSTOMER),
	OutageController.getAllOutages,
);
router.get(
	"/:id",
	auth(Role.ADMIN, Role.OPERATOR, Role.CUSTOMER),
	OutageController.getOutageById,
);

router.patch(
	"/:id",
	auth(Role.ADMIN, Role.OPERATOR),
	validateRequest(OutageValidation.updateOutageSchema),
	OutageController.updateOutage,
);

router.delete("/:id", auth(Role.ADMIN), OutageController.deleteOutage);

export const OutageRoutes = router;
