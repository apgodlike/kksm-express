import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { profileSchema } from "../schemas/profileSchema";
import {
  getProfile,
  getRequestSentController,
  getSuggestedProfiles,
  getUserProfile,
  saveProfile,
} from "../controllers/profileController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { regularSearchController } from "../controllers/searchController";
import { regularSearchSchema } from "../schemas/searchSchema";

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

router.post(
  "/regularsearch/:page",
  authenticateToken,
  validateRequest(regularSearchSchema),
  regularSearchController
);

router.get("/requestsent", authenticateToken, getRequestSentController);

router.post("/sendrequest", authenticateToken, regularSearchController);

router.get("/requestreceived", authenticateToken, regularSearchController);

router.get("/shortlisted", authenticateToken, regularSearchController);

export default router;
