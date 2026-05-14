import { Router } from "express";
import {
  // refreshAccessToken,
  registerUser,
} from "../controllers/authController";
// import { loginUser } from "../controllers/authController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", authenticateToken, registerUser);
// router.post("/login", loginUser);

export default router;
