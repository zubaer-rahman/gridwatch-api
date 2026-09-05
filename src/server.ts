import app from "./app.js";
import config from "./config/index.js";

import { prisma } from "./lib/prisma.js";
import { EmailService } from "./services/email.service.js";
import { OTPService } from "./lib/redis.js";
import { seedSuperAdmin } from "./utils/seed.js";

async function main() {
	try {
		await prisma.$connect();
		console.log("🐘 PostgreSQL connected successfully");

		await OTPService.verifyConnection();
		console.log("🔴 Redis connected successfully");

		await EmailService.verifyConnection();
		console.log("✉️ Nodemailer connected successfully");

		// Inject the Genesis Admin if they don't exist
		await seedSuperAdmin();

		const port = config.port || 5000;

		app.listen(port, () => {
			console.log(`🚀 GridWatch API listening on port ${port}`);
		});
	} catch (error) {
		console.error("❌ Failed to start server:", error);
		await prisma.$disconnect();
		process.exit(1);
	}
}

main();
