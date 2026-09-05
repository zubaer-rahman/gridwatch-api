import nodemailer from "nodemailer";
import config from "../config/index.js";

export const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: config.email.smtp_user,
		pass: config.email.smtp_password,
	},
});
