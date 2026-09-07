import nodemailer from "nodemailer";
import config from "../config/index.js";

export const transporter = nodemailer.createTransport({
	host: config.smtp.host,
	port: Number(config.smtp.port) || 587,
	secure: Number(config.smtp.port) === 465,
	// @ts-ignore: family is passed directly to node's net.connect to force IPv4
	family: 4,
	auth: {
		user: config.smtp.user,
		pass: config.smtp.pass,
	},
});
