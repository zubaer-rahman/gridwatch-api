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
