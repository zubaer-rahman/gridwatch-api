import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest.js";
import { AuthController } from "./auth.controller.js";
import { AuthValidation } from "./auth.validation.js";

const router = Router();

router.post(
	"/register",
	validateRequest(AuthValidation.registerUserSchema),
	AuthController.registerUser,
);

router.post(
	"/verify-email",
	validateRequest(AuthValidation.verifyEmailSchema),
	AuthController.verifyEmail,
);

router.post(
	"/login",
	validateRequest(AuthValidation.loginUserSchema),
	AuthController.loginUser,
);

router.post(
	"/refresh-token",
	validateRequest(AuthValidation.refreshTokenSchema),
	AuthController.refreshToken,
);

router.post(
	"/google-login",
	validateRequest(AuthValidation.googleLoginSchema),
	AuthController.googleLogin,
);

router.post("/logout", AuthController.logoutUser);

export const AuthRoutes = router;
