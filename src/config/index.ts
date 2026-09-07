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
	brevo: {
		api_key: process.env.BREVO_API_KEY,
		sender: process.env.EMAIL_SENDER,
	},
	admin: {
		email: process.env.ADMIN_EMAIL,
		password: process.env.ADMIN_PASSWORD,
	},
	google: {
		client_id: process.env.GOOGLE_CLIENT_ID,
	},
	cloudinary: {
		cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
		api_key: process.env.CLOUDINARY_API_KEY,
		api_secret: process.env.CLOUDINARY_API_SECRET,
	},
};
