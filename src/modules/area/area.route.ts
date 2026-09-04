import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { AreaController } from "./area.controller.js";
import { AreaValidation } from "./area.validation.js";

const router = Router();

router.post(
	"/",
	auth(Role.ADMIN),
	validateRequest(AreaValidation.createAreaSchema),
	AreaController.createArea,
);

router.get("/", AreaController.getAllAreas);
router.get("/:id", AreaController.getAreaById);

router.patch(
	"/:id",
	auth(Role.ADMIN),
	validateRequest(AreaValidation.updateAreaSchema),
	AreaController.updateArea,
);

router.delete("/:id", auth(Role.ADMIN), AreaController.deleteArea);

export const AreaRoutes = router;
