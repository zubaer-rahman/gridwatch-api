import type { NextFunction, Request, Response } from "express";
import type { ZodObject } from "zod";
import catchAsync from "../utils/catchAsync.js";

const validateRequest = (schema: ZodObject) => {
  return catchAsync(
    async (req: Request, _res: Response, next: NextFunction) => {
      const parsedData = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      })) as Record<string, any>;

      req.body = parsedData.body || req.body;
      req.query = parsedData.query || req.query;
      req.params = parsedData.params || req.params;
      req.cookies = parsedData.cookies || req.cookies;

      next();
    },
  );
};

export default validateRequest;
