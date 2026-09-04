import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "node:path";
import config from "../config/index.js";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: config.email.smtp_user,
		pass: config.email.smtp_password,
	},
});

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

	await transporter.sendMail({
		from: config.email.sender || config.email.smtp_user,
		to,
		subject: "GridWatch: Verify Your Email",
		html,
	});
};

const sendWelcomeEmail = async (to: string, name: string) => {
	const templatePath = path.join(
		process.cwd(),
		"src/templates/welcome-email.ejs",
	);

	const html = await ejs.renderFile(templatePath, { name });

	await transporter.sendMail({
		from: config.email.sender || config.email.smtp_user,
		to,
		subject: "Welcome to GridWatch!",
		html,
	});
};

const verifyConnection = async () => {
	await transporter.verify();
};

export const EmailService = {
	sendRegistrationOTP,
	sendWelcomeEmail,
	verifyConnection,
};
