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
import { regularSearchController } from "../controllers/searchController";

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

router.post("/regularsearch/:page", authenticateToken, regularSearchController);

export default router;
