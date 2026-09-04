import app from "./app.js";
import config from "./config/index.js";

async function main() {
	try {
		const port = config.port || 5000;

		app.listen(port, () => {
			console.log(`🚀 GridWatch API listening on port ${port}`);
		});
	} catch (error) {
		console.error("Failed to start server:", error);
	}
}

main();
