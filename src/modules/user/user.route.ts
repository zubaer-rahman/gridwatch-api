import { Role } from "@prisma/client";
import { Router } from "express";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { UserController } from "./user.controller.js";
import { UserValidation } from "./user.validation.js";

const router = Router();

router.post(
	"/",
	auth(Role.ADMIN),
	validateRequest(UserValidation.createUserSchema),
	UserController.createUser,
);

router.get("/", auth(Role.ADMIN), UserController.getAllUsers);

router.patch(
	"/:id",
	auth(Role.ADMIN),
	validateRequest(UserValidation.updateUserSchema),
	UserController.updateUser,
);

export const UserRoutes = router;
