import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { profileSchema } from "../schemas/profileSchema";
import {
  deleteShortlistController,
  getProfile,
  getRequestReceivedController,
  getRequestSentController,
  getShortlistedController,
  getSuggestedProfiles,
  getUserProfile,
  postAcceptRequestController,
  postDeclineRequestController,
  postPhoneNumberController,
  postSendRequestController,
  postShortlistController,
  saveProfile,
} from "../controllers/profileController";
import { authenticateToken } from "../middlewares/authMiddleware";
import { regularSearchController } from "../controllers/searchController";
import { regularSearchSchema } from "../schemas/searchSchema";
import { sendRequestSchema } from "../schemas/sendRequestSchema";

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

router.post(
  "/sendrequest",
  authenticateToken,
  validateRequest(sendRequestSchema),
  postSendRequestController
);

router.post("/shortlist", authenticateToken, postShortlistController);

router.delete("/shortlist", authenticateToken, deleteShortlistController);

router.post("/viewphonenumber", authenticateToken, postPhoneNumberController);

router.get("/requestreceived", authenticateToken, getRequestReceivedController);

router.post("/acceptrequest", authenticateToken, postAcceptRequestController);

router.post("/declinerequest", authenticateToken, postDeclineRequestController);

router.get("/shortlisted", authenticateToken, getShortlistedController);

export default router;
