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
	redis_url: process.env.REDIS_URL,
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
