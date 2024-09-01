import { Router } from "express";
import { validateRequest } from "../middlewares/validateRequest";
import { profileSchema } from "../schemas/profileSchema";
import {
  deleteImageController,
  deleteShortlistController,
  getContactStatusController,
  getNotificationTypeCountsController,
  getPresignedUrlController,
  getProfile,
  getRequestReceivedController,
  getRequestSentController,
  getShortlistedController,
  getSuggestedProfiles,
  getUserProfile,
  getViewNotificationController,
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

router.get("/id/:id", authenticateToken, getProfile); //Notification

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
); //Notification Done

router.post("/shortlist", authenticateToken, postShortlistController);

router.delete("/shortlist", authenticateToken, deleteShortlistController);

router.post("/viewphonenumber", authenticateToken, postPhoneNumberController); //Notification Done

router.get("/requestreceived", authenticateToken, getRequestReceivedController);

router.post("/acceptrequest", authenticateToken, postAcceptRequestController); //Notification Done

router.post("/declinerequest", authenticateToken, postDeclineRequestController); //Notification Done

router.get("/shortlisted", authenticateToken, getShortlistedController);

router.get("/presignedurl", authenticateToken, getPresignedUrlController);

router.delete("/deleteimage", authenticateToken, deleteImageController);

router.get("/contactstatus", authenticateToken, getContactStatusController);

router.get(
  "/notificationcount",
  authenticateToken,
  getNotificationTypeCountsController
);

router.get(
  "/viewnotification/:page",
  authenticateToken,
  getViewNotificationController
);

export default router;
