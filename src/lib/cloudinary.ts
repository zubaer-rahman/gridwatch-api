import { v2 as cloudinary } from "cloudinary";
import config from "../config/index.js";

cloudinary.config({
	cloud_name: config.cloudinary.cloud_name,
	api_key: config.cloudinary.api_key,
	api_secret: config.cloudinary.api_secret,
});

export const uploadToCloudinary = async (
	fileBuffer: Buffer,
	folder: string,
	filename: string,
): Promise<{ secure_url: string }> => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder,
				public_id: filename,
				resource_type: "auto",
			},
			(error, result) => {
				if (error) return reject(error);
				if (result) return resolve(result as { secure_url: string });
			},
		);

		uploadStream.end(fileBuffer);
	});
};
