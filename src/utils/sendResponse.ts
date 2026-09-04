import type { Response } from "express";

type TMeta = {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
};

type TResponseData<T> = {
	statusCode: number;
	message?: string;
	data: T;
	meta?: TMeta;
};

const sendResponse = <T>(res: Response, data: TResponseData<T>) => {
	res.status(data.statusCode).json({
		success: true,
		message: data.message || "Operation successful",
		data: data.data,
		...(data.meta && { meta: data.meta }),
	});
};

export default sendResponse;
