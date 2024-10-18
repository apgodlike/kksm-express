import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { registerSchema } from "../schemas/registerSchema";
import { loginUser, registerUser } from "../controllers/authController";
import { loginSchema } from "../schemas/loginSchema";
import { otpVerificationService } from "../services/emailService";
import { mobileOtpSchema } from "../schemas/mobileOtpSchema";

const router = Router();

router.post("/register", validateRequest(registerSchema), registerUser);
router.post("/login", validateRequest(loginSchema), loginUser);
router.post(
  "/requestmobilenumberotp",
  validateRequest(mobileOtpSchema),
  otpVerificationService
);
router.post("/");

export default router;
