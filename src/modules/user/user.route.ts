import { Role } from "@prisma/client";
import { Router } from "express";
import { upload } from "../../lib/multer.js";
import auth from "../../middlewares/auth.js";
import validateRequest from "../../middlewares/validateRequest.js";
import { UserController } from "./user.controller.js";
import { UserValidation } from "./user.validation.js";

const router = Router();

router.get(
	"/me",
	auth(Role.CUSTOMER, Role.OPERATOR, Role.ADMIN),
	UserController.getMe,
);

router.patch(
	"/me/avatar",
	auth(Role.CUSTOMER, Role.OPERATOR, Role.ADMIN),
	upload.single("file"),
	UserController.uploadAvatar,
);

router.post(
	"/",
	auth(Role.ADMIN),
	validateRequest(UserValidation.createUserSchema),
	UserController.createUser,
);

router.get("/", auth(Role.ADMIN, Role.OPERATOR), UserController.getAllUsers);

router.patch(
	"/:id",
	auth(Role.ADMIN),
	validateRequest(UserValidation.updateUserSchema),
	UserController.updateUser,
);

export const UserRoutes = router;
