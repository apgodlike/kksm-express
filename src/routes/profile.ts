import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { profileSchema } from "../schemas/profileSchema";
import {
  getProfile,
  getSuggestedProfiles,
  getUserProfile,
  saveProfile,
} from "../controllers/profileController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();

router.post(
  "/saveprofile",
  authenticateToken,
  validateRequest(profileSchema),
  saveProfile
);

router.get("/id/:id", getProfile);

router.get("/getuserprofile", authenticateToken, getUserProfile);

router.get("/suggestedprofiles/:page", authenticateToken, getSuggestedProfiles);

export default router;
