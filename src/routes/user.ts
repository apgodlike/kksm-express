import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { registerSchema } from "../schemas/registerSchema";
import {
  forgetPasswordController,
  loginUser,
  registerUser,
  validateOtpController,
} from "../controllers/authController";
import { loginSchema } from "../schemas/loginSchema";
import { otpVerificationService } from "../services/emailService";
import { mobileOtpSchema } from "../schemas/mobileOtpSchema";
import { validateOtpSchema } from "../schemas/validateOtpSchema";

const router = Router();

router.post("/register", validateRequest(registerSchema), registerUser);
router.post("/login", validateRequest(loginSchema), loginUser);
router.post(
  "/requestmobilenumberotp",
  validateRequest(mobileOtpSchema),
  otpVerificationService
);
router.post(
  "/forget-password-request-otp",
  validateRequest(mobileOtpSchema),
  forgetPasswordController
);
router.post(
  "/validate-otp",
  validateRequest(validateOtpSchema),
  validateOtpController
);

export default router;
