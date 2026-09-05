import { Router } from "express";
import { AdminRoutes } from "../modules/admin/admin.route.js";
import { AreaRoutes } from "../modules/area/area.route.js";
import { AssignmentRoutes } from "../modules/assignment/assignment.route.js";
import { AuthRoutes } from "../modules/auth/auth.route.js";
import { FeederRoutes } from "../modules/feeder/feeder.route.js";
import { NotificationRoutes } from "../modules/notification/notification.route.js";
import { OutageRoutes } from "../modules/outage/outage.route.js";
import { PaymentRoutes } from "../modules/payment/payment.route.js";
import { ReportRoutes } from "../modules/report/report.route.js";
import { ScheduleRoutes } from "../modules/schedule/schedule.route.js";
import { SubstationRoutes } from "../modules/substation/substation.route.js";
import { UserRoutes } from "../modules/user/user.route.js";
import { ZoneRoutes } from "../modules/zone/zone.route.js";

const router = Router();

const moduleRoutes = [
	{
		path: "/auth",
		route: AuthRoutes,
	},
	{
		path: "/users",
		route: UserRoutes,
	},
	{
		path: "/zones",
		route: ZoneRoutes,
	},
	{
		path: "/substations",
		route: SubstationRoutes,
	},
	{
		path: "/feeders",
		route: FeederRoutes,
	},
	{
		path: "/areas",
		route: AreaRoutes,
	},
	{
		path: "/outages",
		route: OutageRoutes,
	},
	{
		path: "/reports",
		route: ReportRoutes,
	},
	{
		path: "/assignments",
		route: AssignmentRoutes,
	},
	{
		path: "/schedules",
		route: ScheduleRoutes,
	},
	{
		path: "/payments",
		route: PaymentRoutes,
	},
	{
		path: "/notifications",
		route: NotificationRoutes,
	},
	{
		path: "/admin",
		route: AdminRoutes,
	},
];

moduleRoutes.forEach((route) => {
	router.use(route.path, route.route);
});

export default router;
