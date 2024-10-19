import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { registerSchema } from "../schemas/registerSchema";
import {
  changePasswordController,
  forgetPasswordController,
  loginUser,
  registerUser,
  validateAsLoggedInOtpController,
  validateOtpController,
} from "../controllers/authController";
import { loginSchema } from "../schemas/loginSchema";
import { otpVerificationService } from "../services/emailService";
import { mobileOtpSchema } from "../schemas/mobileOtpSchema";
import { validateOtpSchema } from "../schemas/validateOtpSchema";
import { authMiddleware } from "../middlewares/middleware";

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
  "/forget-password-validate-otp",
  validateRequest(validateOtpSchema),
  validateOtpController
);

router.post(
  "/change-password-request-otp",
  authMiddleware,
  validateRequest(mobileOtpSchema),
  changePasswordController
);

router.post(
  "/change-password-validate-otp",
  authMiddleware,
  validateRequest(validateOtpSchema),
  validateAsLoggedInOtpController
);

export default router;
