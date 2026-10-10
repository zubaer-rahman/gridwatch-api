import { seedNotifications, seedSuperAdmin } from "../src/utils/seed.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
	await seedSuperAdmin();
	await seedNotifications();
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
