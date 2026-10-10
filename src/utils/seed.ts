import { Role } from "@prisma/client";
import bcrypt from "bcrypt";
import config from "../config/index.js";
import { prisma } from "../lib/prisma.js";

export const seedSuperAdmin = async () => {
	try {
		// Check if an ADMIN already exists
		const existingAdmin = await prisma.user.findFirst({
			where: { role: Role.ADMIN },
		});

		if (existingAdmin) {
			console.log("🛡️  Super Admin already exists. Seeding skipped.");
			return;
		}

		console.log("🌱 Seeding Genesis Super Admin...");

		const adminEmail = config.admin.email;
		const adminPassword = config.admin.password;

		if (!adminEmail || !adminPassword) {
			console.log(
				"⚠️  ADMIN_EMAIL or ADMIN_PASSWORD missing in .env. Skipping Genesis Admin seeding.",
			);
			return;
		}

		const hashedPassword = await bcrypt.hash(
			adminPassword,
			Number(config.bcrypt_salt_rounds || 10),
		);

		await prisma.user.create({
			data: {
				name: "Super Admin",
				email: adminEmail,
				password: hashedPassword,
				role: Role.ADMIN,
				isActive: true,
				contactNumber: "+8801700000000",
			},
		});

		console.log("✅ Genesis Super Admin created successfully!");
	} catch (error) {
		console.error("❌ Failed to seed Super Admin:", error);
	}
};

export const seedNotifications = async () => {
	try {
		const users = await prisma.user.findMany({
			where: { deletedAt: null },
			select: { id: true, role: true, name: true },
		});

		for (const user of users) {
			const existingCount = await prisma.notification.count({
				where: { userId: user.id },
			});
			if (existingCount > 0) continue;

			if (user.role === Role.ADMIN) {
				await prisma.notification.createMany({
					data: [
						{
							userId: user.id,
							title: "System Telemetry Online",
							message:
								"All 12 substations and transmission lines are broadcasting nominal metrics.",
							isRead: false,
						},
						{
							userId: user.id,
							title: "Peak Load Advisory",
							message:
								"Dhaka Central sector reached 82% feeder capacity during afternoon hours.",
							isRead: false,
						},
						{
							userId: user.id,
							title: "System Audit Logged",
							message:
								"Automatic daily security check and role sync verified successfully.",
							isRead: true,
						},
					],
				});
			} else if (user.role === Role.OPERATOR) {
				await prisma.notification.createMany({
					data: [
						{
							userId: user.id,
							title: "Shift Telemetry Ready",
							message:
								"Scheduled feeder inspection assigned for Mirpur Substation.",
							isRead: false,
						},
						{
							userId: user.id,
							title: "Grid Alert Acknowledged",
							message:
								"Gulshan-2 feeder maintenance window confirmed by SCADA team.",
							isRead: false,
						},
						{
							userId: user.id,
							title: "Work Order Completed",
							message:
								"Work order #ORD-4029 marked resolved and safety verified.",
							isRead: true,
						},
					],
				});
			} else {
				// CUSTOMER
				await prisma.notification.createMany({
					data: [
						{
							userId: user.id,
							title: "Welcome to GridWatch",
							message:
								"Your residential consumer account is verified and ready for real-time alerts.",
							isRead: false,
						},
						{
							userId: user.id,
							title: "Scheduled Maintenance Advisory",
							message:
								"Preventive grid maintenance scheduled in your zone on Sunday 02:00 - 04:00 AM.",
							isRead: false,
						},
						{
							userId: user.id,
							title: "Power Restored",
							message:
								"Grid normalisation confirmed for recent feeder outage in your area.",
							isRead: true,
						},
					],
				});
			}
		}
		console.log("🔔 Seeded demo notifications for users.");
	} catch (error) {
		console.error("❌ Failed to seed notifications:", error);
	}
};

export const seedSchedules = async () => {
	try {
		const existingCount = await prisma.schedule.count({
			where: { deletedAt: null },
		});
		if (existingCount > 0) return;

		const area = await prisma.area.findFirst({
			where: { deletedAt: null },
		});
		if (!area) return;

		const now = Date.now();
		await prisma.schedule.createMany({
			data: [
				{
					areaId: area.id,
					startsAt: new Date(now + 2 * 60 * 60 * 1000),
					endsAt: new Date(now + 4 * 60 * 60 * 1000),
					status: "UPCOMING",
					reason:
						"Substation Transformer Overhaul & Busbar Tightening",
				},
				{
					areaId: area.id,
					startsAt: new Date(now + 24 * 60 * 60 * 1000),
					endsAt: new Date(now + 27 * 60 * 60 * 1000),
					status: "UPCOMING",
					reason:
						"Feeder Line Load Balancing & Preventive Tree Trimming",
				},
				{
					areaId: area.id,
					startsAt: new Date(now - 4 * 60 * 60 * 1000),
					endsAt: new Date(now - 1 * 60 * 60 * 1000),
					status: "COMPLETED",
					reason: "Capacitor Bank Calibration & Surge Arrestor Test",
				},
			],
		});
		console.log("📅 Seeded demo load shedding & maintenance schedules.");
	} catch (error) {
		console.error("❌ Failed to seed schedules:", error);
	}
};


