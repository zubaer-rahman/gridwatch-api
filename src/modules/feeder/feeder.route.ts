import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { FeederController } from "./feeder.controller.js";
import { FeederValidation } from "./feeder.validation.js";

const router = Router();

router.post(
	"/",
	auth(Role.ADMIN),
	validateRequest(FeederValidation.createFeederSchema),
	FeederController.createFeeder,
);

router.get("/", FeederController.getAllFeeders);
router.get("/:id", FeederController.getFeederById);

router.patch(
	"/:id",
	auth(Role.ADMIN),
	validateRequest(FeederValidation.updateFeederSchema),
	FeederController.updateFeeder,
);

router.delete("/:id", auth(Role.ADMIN), FeederController.deleteFeeder);

export const FeederRoutes = router;
