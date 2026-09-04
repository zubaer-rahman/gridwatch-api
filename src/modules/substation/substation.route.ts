import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { SubstationController } from "./substation.controller.js";
import { SubstationValidation } from "./substation.validation.js";

const router = Router();

router.post(
	"/",
	auth(Role.ADMIN),
	validateRequest(SubstationValidation.createSubstationSchema),
	SubstationController.createSubstation,
);

router.get("/", SubstationController.getAllSubstations);
router.get("/:id", SubstationController.getSubstationById);

router.patch(
	"/:id",
	auth(Role.ADMIN),
	validateRequest(SubstationValidation.updateSubstationSchema),
	SubstationController.updateSubstation,
);

router.delete("/:id", auth(Role.ADMIN), SubstationController.deleteSubstation);

export const SubstationRoutes = router;
