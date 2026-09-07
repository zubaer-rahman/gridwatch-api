import path from "node:path";
import ejs from "ejs";
import { transporter } from "../lib/nodemailer.js";
import config from "../config/index.js";

const sendRegistrationOTP = async (
	to: string,
	name: string,
	otp: string,
	expirationMinutes: number,
) => {
	const templatePath = path.join(
		process.cwd(),
		"src/templates/registration-otp.ejs",
	);

	const html = await ejs.renderFile(templatePath, {
		name,
		otp,
		expirationMinutes,
	});

	try {
		await transporter.sendMail({
			from: `"GridWatch" <${config.smtp.user}>`,
			to,
			subject: "GridWatch: Verify Your Email",
			html,
		});
	} catch (error) {
		console.error("Nodemailer error:", error);
		throw new Error("Failed to send OTP email");
	}
};

const sendWelcomeEmail = async (to: string, name: string) => {
	const templatePath = path.join(
		process.cwd(),
		"src/templates/welcome-email.ejs",
	);

	const html = await ejs.renderFile(templatePath, { name });

	try {
		await transporter.sendMail({
			from: `"GridWatch" <${config.smtp.user}>`,
			to,
			subject: "Welcome to GridWatch!",
			html,
		});
	} catch (error) {
		console.error("Nodemailer error:", error);
		throw new Error("Failed to send welcome email");
	}
};

const verifyConnection = async () => {
	try {
		await transporter.verify();
		console.log("✉️ SMTP connected successfully");
	} catch (error) {
		console.error("SMTP Connection Error:", error);
	}
};

export const EmailService = {
	sendRegistrationOTP,
	sendWelcomeEmail,
	verifyConnection,
};
