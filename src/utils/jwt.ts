import jwt, { type SignOptions } from "jsonwebtoken";

const createToken = (
	payload: Record<string, unknown>,
	secret: string,
	expiresIn: string,
) => {
	return jwt.sign(payload, secret, {
		expiresIn: expiresIn as SignOptions["expiresIn"],
	});
};

const verifyToken = (token: string, secret: string) => {
	return jwt.verify(token, secret);
};

export const jwtUtils = {
	createToken,
	verifyToken,
};
