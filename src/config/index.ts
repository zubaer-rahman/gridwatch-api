import path from "node:path";
import dotenv from "dotenv";

dotenv.config({ path: path.join(process.cwd(), ".env") });

export default {
	env: process.env.NODE_ENV,
	port: process.env.PORT,
	database_url: process.env.DATABASE_URL,
	jwt: {
		secret: process.env.JWT_SECRET,
		refresh_secret: process.env.JWT_REFRESH_SECRET,
		expires_in: process.env.JWT_EXPIRES_IN,
		refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN,
	},
	bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
	redis: {
		url: process.env.REDIS_URL,
	},
	bkash: {
		base_url: process.env.BKASH_BASE_URL,
		callback_url: process.env.BKASH_CALLBACK_URL,
		username: process.env.BKASH_USERNAME,
		password: process.env.BKASH_PASSWORD,
		app_key: process.env.BKASH_APP_KEY,
		app_secret: process.env.BKASH_APP_SECRET,
	},
	email: {
		smtp_user: process.env.SMTP_USER,
		smtp_password: process.env.SMTP_PASSWORD,
		sender: process.env.EMAIL_SENDER,
	},
	admin: {
		email: process.env.ADMIN_EMAIL,
		password: process.env.ADMIN_PASSWORD,
	},
};
