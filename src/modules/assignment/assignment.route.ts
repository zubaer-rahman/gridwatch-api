import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { AssignmentController } from "./assignment.controller.js";
import { AssignmentValidation } from "./assignment.validation.js";

const router = Router();

router.post(
	"/",
	auth(Role.ADMIN, Role.OPERATOR),
	validateRequest(AssignmentValidation.createAssignmentSchema),
	AssignmentController.createAssignment,
);

router.get(
	"/",
	auth(Role.ADMIN, Role.OPERATOR),
	validateRequest(AssignmentValidation.getAllAssignmentsQuerySchema),
	AssignmentController.getAllAssignments,
);

router.get(
	"/:id",
	auth(Role.ADMIN, Role.OPERATOR),
	AssignmentController.getAssignmentById,
);

router.delete(
	"/:id",
	auth(Role.ADMIN, Role.OPERATOR),
	AssignmentController.deleteAssignment,
);

export const AssignmentRoutes = router;
