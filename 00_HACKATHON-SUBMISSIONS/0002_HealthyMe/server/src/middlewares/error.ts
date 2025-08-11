
import { NextFunction, Request, Response } from "express";
import ErrorHandler from "../utils/errorHandler.js";
import { envMode } from "../app.js";

export const errorMiddleware = (err:ErrorHandler, req:Request, res:Response, next:NextFunction)=> {

  err.message||= "Internal Server Error";
  err.statusCode = err.statusCode || 500;
  
  const response:{
    success: boolean,
    message: string,
    error?:ErrorHandler
  } = {
    success: false,
    message: err.message,
  };

  if (envMode === "DEVELOPMENT") {
    response.error = err;
  }

  return res.status(err.statusCode).json(response);

};

type ControllerType = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response<any, Record<string, any>>>;

export const TryCatch = (passedFunc:ControllerType) => async (req:Request, res:Response, next:NextFunction) => {
  try {
    await passedFunc(req, res, next);
  } catch (error) {
    next(error);
  }
};

