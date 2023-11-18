import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload | null;
    }
  }
}

export const extractUserInfo = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session?.jwt) {
    req.user = null;
  } else {
    try {
      const jwtPayload = jwt.verify(
        req.session.jwt,
        process.env.JWT_KEY!
      ) as UserPayload;

      req.user = jwtPayload;
    } catch (error) {
      req.user = null;
    }
  }

  next();
};
