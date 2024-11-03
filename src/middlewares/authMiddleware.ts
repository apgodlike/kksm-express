import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in the environment variables");
}

export interface JwtPayload {
  userId: number;
  isProfileCompleted: boolean;
  isActive: boolean;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  // try {
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }

    console.log("user");
    console.log(user);
    (req as any).user = user as JwtPayload;
    next();
  });
  // } catch (error) {
  //   return res.status(403).json({ error: "Invalid Token" });
  // }
};

export const authenticateCompletedProfile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const isActive = req.user.isActive;

  if (!isActive) {
    return res.status(403).json({ error: "Profile Not Active" });
  }

  // @ts-ignore
  const isCompleted = req.user.isProfileCompleted;

  if (!isCompleted) {
    return res.status(403).json({ error: "Profile Not Compelted" });
  }

  next();
};
