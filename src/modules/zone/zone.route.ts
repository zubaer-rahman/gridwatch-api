import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { ZoneController } from "./zone.controller.js";
import { ZoneValidation } from "./zone.validation.js";

const router = Router();

router.post(
	"/",
	auth(Role.ADMIN),
	validateRequest(ZoneValidation.createZoneSchema),
	ZoneController.createZone,
);

router.get("/", ZoneController.getAllZones);
router.get("/:id", ZoneController.getZoneById);

router.patch(
	"/:id",
	auth(Role.ADMIN),
	validateRequest(ZoneValidation.updateZoneSchema),
	ZoneController.updateZone,
);

router.delete("/:id", auth(Role.ADMIN), ZoneController.deleteZone);

export const ZoneRoutes = router;
