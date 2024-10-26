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
import {
  authenticateCompletedProfile,
  authenticateToken,
} from "../middlewares/authMiddleware";
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

router.get(
  "/id/:id",
  authenticateToken,
  authenticateCompletedProfile,
  getProfile
); //Notification

router.get("/getuserprofile", authenticateToken, getUserProfile);

router.get(
  "/suggestedprofiles/:page",
  authenticateToken,
  authenticateCompletedProfile,
  getSuggestedProfiles
);

router.post(
  "/regularsearch",
  authenticateToken,
  validateRequest(regularSearchSchema),
  authenticateCompletedProfile,
  regularSearchController
);

router.get(
  "/requestsent",
  authenticateToken,
  authenticateCompletedProfile,
  getRequestSentController
);

router.post(
  "/sendrequest",
  authenticateToken,
  authenticateCompletedProfile,
  validateRequest(sendRequestSchema),
  postSendRequestController
); //Notification Done

router.post(
  "/shortlist",
  authenticateToken,
  authenticateCompletedProfile,
  postShortlistController
);

router.delete(
  "/shortlist",
  authenticateToken,
  authenticateCompletedProfile,
  deleteShortlistController
);

router.post(
  "/viewphonenumber",
  authenticateToken,
  authenticateCompletedProfile,
  postPhoneNumberController
); //Notification Done

router.get(
  "/requestreceived",
  authenticateToken,
  authenticateCompletedProfile,
  getRequestReceivedController
);

router.post(
  "/acceptrequest",
  authenticateToken,
  authenticateCompletedProfile,
  postAcceptRequestController
); //Notification Done

router.post(
  "/declinerequest",
  authenticateToken,
  authenticateCompletedProfile,
  postDeclineRequestController
); //Notification Done

router.get(
  "/shortlisted",
  authenticateToken,
  authenticateCompletedProfile,
  getShortlistedController
);

router.get(
  "/presignedurl",
  authenticateToken,
  authenticateCompletedProfile,
  getPresignedUrlController
);

router.delete(
  "/deleteimage",
  authenticateToken,
  authenticateCompletedProfile,
  deleteImageController
);

router.get(
  "/contactstatus",
  authenticateToken,
  authenticateCompletedProfile,
  getContactStatusController
);

router.get(
  "/notificationcount",
  authenticateToken,
  authenticateCompletedProfile,
  getNotificationTypeCountsController
);

router.get(
  "/viewnotification/:page",
  authenticateToken,
  authenticateCompletedProfile,
  getViewNotificationController
);

export default router;
