import path from "node:path";
import ejs from "ejs";
import config from "../config/index.js";

const sendBrevoEmail = async (to: string, name: string, subject: string, htmlContent: string) => {
	const response = await fetch("https://api.brevo.com/v3/smtp/email", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"api-key": config.brevo.api_key as string,
		},
		body: JSON.stringify({
			sender: {
				name: "GridWatch",
				email: config.brevo.sender || "test@example.com",
			},
			to: [
				{
					email: to,
					name: name,
				},
			],
			subject: subject,
			htmlContent: htmlContent,
		}),
	});

	if (!response.ok) {
		const errorData = await response.text();
		console.error("Brevo API error:", errorData);
		throw new Error("Failed to send email via Brevo");
	}
};

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
		await sendBrevoEmail(to, name, "GridWatch: Verify Your Email", html);
	} catch (error: any) {
		console.error("Email service error:", error);
		throw new Error("Failed to send OTP email: " + error.message);
	}
};

const sendWelcomeEmail = async (to: string, name: string) => {
	const templatePath = path.join(
		process.cwd(),
		"src/templates/welcome-email.ejs",
	);

	const html = await ejs.renderFile(templatePath, { name });

	try {
		await sendBrevoEmail(to, name, "Welcome to GridWatch!", html);
	} catch (error: any) {
		console.error("Email service error:", error);
		throw new Error("Failed to send welcome email: " + error.message);
	}
};

const verifyConnection = async () => {
	if (!config.brevo.api_key) {
		console.warn("⚠️ BREVO_API_KEY is not set. Emails will not be sent.");
	} else {
		console.log("✉️ Brevo API key is configured.");
	}
};

export const EmailService = {
	sendRegistrationOTP,
	sendWelcomeEmail,
	verifyConnection,
};
