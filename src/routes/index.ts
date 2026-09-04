import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.route.js";
import { ZoneRoutes } from "../modules/zone/zone.route.js";

const router = Router();

const moduleRoutes = [
	{
		path: "/auth",
		route: AuthRoutes,
	},
	{
		path: "/zones",
		route: ZoneRoutes,
	},
];

moduleRoutes.forEach((route) => {
	router.use(route.path, route.route);
});

export default router;
