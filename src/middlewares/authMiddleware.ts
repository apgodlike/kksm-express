import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { auth } from "firebase-admin";
import * as admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import { cert } from "firebase-admin/app";

dotenv.config();

// const JWT_SECRET = process.env.JWT_SECRET;

// if (!JWT_SECRET) {
//   throw new Error("JWT_SECRET is not defined in the environment variables");
// }
const serviceAccount = require(path.join(
  __dirname,
  "../../kksm05-firebase-adminsdk-g6ipa-35e3ea6e00.json"
));
// Initialize Firebase Admin
admin.initializeApp({
  credential: cert(serviceAccount as admin.ServiceAccount),
  //admin.credential.applicationDefault(),
  // Or use service account:
  // credential: admin.credential.cert(require('./path-to-service-account.json'))
});

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: auth.DecodedIdToken;
    }
  }
}

export interface JwtPayload {
  userId: number;
  isProfileCompleted: boolean;
  isActive: boolean;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  console.log("token...", token);
  if (!token) {
    return res.sendStatus(401);
  }

  try {
    // jwt.verify(token, process.env.JWT_ACCESS_SECRET!, (err, user) => {
    //   if (err) {
    //     return res.sendStatus(403);
    //   }

    const user = await admin.auth().verifyIdToken(token);

    user.userId = user.uid;
    console.log("user");
    console.log(user);
    (req as any).user = user;
    next();
    // });
  } catch (error) {
    return res.status(401).json({ error: "Invalid Token" });
  }
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
