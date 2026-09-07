import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport/index.js";
import config from "../config/index.js";

export const transporter = nodemailer.createTransport({
	host: "smtp.gmail.com",
	port: 465,
	secure: true,
	auth: {
		user: config.email.smtp_user,
		pass: config.email.smtp_password,
	},
	tls: {
		rejectUnauthorized: false,
	},
} as SMTPTransport.Options);
