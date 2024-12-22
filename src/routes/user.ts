import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { registerSchema } from "../schemas/registerSchema";
import {
  // changePasswordController,
  deactivateAccountController,
  // deleteAccountController,
  // forgetPasswordController,
  getCheckSubscriptionController,
  getLogoutUserController,
  // loginUser,
  postSubscriptionController,
  // refreshAccessToken,
  registerUser,
  validateAsLoggedInOtpController,
  // validateOtpController,
} from "../controllers/authController";
import { loginSchema } from "../schemas/loginSchema";
// import { otpVerificationService } from "../services/emailService";
import { mobileOtpSchema } from "../schemas/mobileOtpSchema";
import { validateOtpSchema } from "../schemas/validateOtpSchema";
import {
  authenticateCompletedProfile,
  authenticateToken,
} from "../middlewares/authMiddleware";
import { deactivateAccountSchema } from "../schemas/deactivateAccountSchema";
import { getValidUser } from "../controllers/profileController";

const router = Router();

router.post(
  "/register",
  authenticateToken,
  validateRequest(registerSchema),
  registerUser
);

router.get("/user-valid", authenticateToken, getValidUser);

// router.post("/login", validateRequest(loginSchema), loginUser);
// router.get("/refresh-token", refreshAccessToken);
router.get("/logout", authenticateToken, getLogoutUserController);

// router.post(
//   "/requestmobilenumberotp",
//   validateRequest(mobileOtpSchema),
//   otpVerificationService
// );

router.get(
  "/check-subscription",
  authenticateToken,
  getCheckSubscriptionController
);

router.post("/subscription", authenticateToken, postSubscriptionController);

// router.post(
//   "/forget-password-request-otp",
//   validateRequest(mobileOtpSchema),
//   forgetPasswordController
// );

// router.post(
//   "/forget-password-validate-otp",
//   validateRequest(validateOtpSchema),
//   validateOtpController
// );

// router.post(
//   "/change-password-request-otp",
//   authenticateToken,
//   authenticateCompletedProfile,
//   validateRequest(mobileOtpSchema),
//   changePasswordController
// );

router.post(
  "/change-password-validate-otp",
  authenticateToken,
  authenticateCompletedProfile,
  validateRequest(validateOtpSchema),
  validateAsLoggedInOtpController
);

router.post(
  "/deactivate-account",
  authenticateToken,
  validateRequest(deactivateAccountSchema),
  deactivateAccountController
);

// router.post(
//   "/delete-account",
//   authenticateToken,
//   validateRequest(deactivateAccountSchema),
//   deleteAccountController
// );

export default router;
