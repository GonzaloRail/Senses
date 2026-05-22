import { Request, Response, NextFunction } from "express";
import { AppError } from "../../common/utils";
import { verifyToken } from "../utils/jwt";

// Extend Express Request interface to include 'authUser'
declare global {
  namespace Express {
    interface Request {
      authUser?: any;
    }
  }
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new AppError("Authorization header is missing", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    // const decoded = jwt.verify(token, secretKey);
    const decoded = verifyToken(token, "access");
    req.authUser = decoded;
    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return next(new AppError("Invalid token or expired ", 401));
    }

    return next(new AppError("Authentication error", 401));
  }
};
