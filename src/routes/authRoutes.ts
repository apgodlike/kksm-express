import { Router } from "express";
import {
  refreshAccessToken,
  registerUser,
} from "../controllers/authController";
import { loginUser } from "../controllers/authController";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;
