import { NextFunction, Request, Response } from "express";
import {
  deleteAwsFileService,
  deleteShortlistService,
  getContactStatusService,
  getNotificationTypeCountsService,
  getPresignedUrlService,
  getProfileById,
  getProfileByUserId,
  getRequestReceivedService,
  getRequestSentService,
  getShortlistedService,
  getSuggestedProfilesService,
  getViewNotificationService,
  postAcceptRequestService,
  postDeclineRequestService,
  postPhoneNumberService,
  postSendRequestService,
  postShortlistService,
  saveProfileByUserId,
  updateOneProfileField,
} from "../services/profileService";
import { regularSearchProfileService } from "../services/regularSearchService";
import { Prisma } from "@prisma/client";
import { generateAccessToken, generateRefreshToken } from "./authController";
import { getUserRecord, setUserClaims } from "../services/userService";
import { getCookieDomain } from "../config";
import prisma from "../utils/prisma";
import { messaging } from "firebase-admin";
import { AppError } from "../utils/AppError";

export const saveProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userRecord = await getUserRecord(req.user.userId);

    if (!userRecord) {
      return next(new AppError("Something went wrong", 400));
    }

    const createdProfile = await saveProfileByUserId(req.body, userRecord.id);

    if (!createdProfile) {
      return next(new AppError("Something went wrong", 400));
    }

    if (userRecord?.is_profile_complete) {
      return res.status(201).json({ message: "Profile Updated Successfully" });
    }

    await setUserClaims(userRecord.id, {
      userId: userRecord.id,
      isRegistered: true,
      isProfileCompleted: true,
    });

    res.status(200).json({ message: "Created" });
  } catch (err) {
    next(err);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    // @ts-ignore
    const userId = req.user.userId;
    const userProfile = await getProfileByUserId(userId);
    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const profile = await getProfileById(id, userProfile.id);
    if (profile) {
      res.status(200).json(profile);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    next(err);
  }
};

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const id = req.user.userId;
    const profile = await getProfileByUserId(id);
    if (profile) {
      return res.status(200).json(profile);
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    next(err);
  }
};

export const getSuggestedProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const userProfile = await getProfileByUserId(userProfileId);
    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const page = Number(req.params.page);
    // @ts-ignore
    const profiles = await getSuggestedProfilesService(
      page,
      10,
      userProfile.gender,
      userProfile.id
    );
    if (profiles) {
      res.status(200).json(profiles);
    } else {
      res.status(404).json({ error: "Profiles not found" });
    }
  } catch (err) {
    next(err);
  }
};

export const postRegularSearchController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const response = await regularSearchProfileService(req.body);
  } catch (err) {
    next(err);
  }
};

export const getRequestSentController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const status = req.query.status;
    const userProfile = await getProfileByUserId(String(userProfileId));
    if (!userProfile) {
      return res.sendStatus(404);
    }

    // @ts-ignore
    const response = await getRequestSentService(userProfile.id, status);
    if (!response) {
      return res.sendStatus(404);
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const postSendRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const userProfile = await getProfileByUserId(userProfileId);
    const requestedTo = req.body.requested_to;
    // @ts-ignore
    const requestedBy = userProfile.id;

    const response = await postSendRequestService(requestedBy, requestedTo);
    res.status(201).json(response);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return next(new AppError("Already sent Request", 409));
    }
    next(err);
  }
};

export const postShortlistController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const userProfile = await getProfileByUserId(userProfileId);
    const requestedTo = req.body.requested_to;
    // @ts-ignore
    const requestedBy = userProfile.id;

    const response = await postShortlistService(requestedBy, requestedTo);
    res.status(201).json(response);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return next(new AppError("This profile is already shortlisted.", 409));
    }
    next(err);
  }
};

export const deleteShortlistController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const userProfile = await getProfileByUserId(userProfileId);
    const requestedTo = req.body.requested_to;
    // @ts-ignore
    const requestedBy = userProfile.id;

    const response = await deleteShortlistService(requestedBy, requestedTo);

    if (response.count == 1) {
      return res.status(200).json({ message: "Successfully Deleted" });
    }
    if (response.count == 0) {
      return res.sendStatus(404);
    }
    res.sendStatus(500);
  } catch (err) {
    next(err);
  }
};

export const postPhoneNumberController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const userProfile = await getProfileByUserId(userProfileId);
    if (!userProfile) {
      return res.sendStatus(404);
    }

    const requestedTo = req.body.requested_to;
    // @ts-ignore
    const requestedBy = userProfile.id;

    const response = await postPhoneNumberService(requestedBy, requestedTo);
    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const getRequestReceivedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const status = req.query.status;
    const userProfile = await getProfileByUserId(String(userProfileId));
    if (!userProfile) {
      return res.sendStatus(404);
    }

    // @ts-ignore
    const response = await getRequestReceivedService(userProfile.id, status);
    if (!response) {
      return res.sendStatus(404);
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const postAcceptRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const userProfile = await getProfileByUserId(String(userProfileId));
    if (!userProfile) {
      return res.sendStatus(404);
    }

    const requestedBy = req.body.requested_by;
    // @ts-ignore
    const acceptedBy = userProfile.id;

    const response = await postAcceptRequestService(requestedBy, acceptedBy);
    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const postDeclineRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const userProfile = await getProfileByUserId(String(userProfileId));
    if (!userProfile) {
      return res.sendStatus(404);
    }

    const requestedBy = req.body.requested_by;
    // @ts-ignore
    const declinedBy = userProfile.id;

    const response = await postDeclineRequestService(requestedBy, declinedBy);
    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const getShortlistedController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const status = req.query.status;
    const userProfile = await getProfileByUserId(String(userProfileId));
    if (!userProfile) {
      return res.sendStatus(404);
    }

    // @ts-ignore
    const response = await getShortlistedService(userProfile.id);
    if (!response) {
      return res.sendStatus(404);
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const getPresignedUrlController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const imageNumber = req.query.image;
    const userProfile = await getProfileByUserId(String(userProfileId));

    if (!userProfile) {
      return res.sendStatus(404);
    }

    const key = `kksm/${userProfile.id}/${Math.random()}/image.jpg`;

    const response = await getPresignedUrlService(key);
    if (!response) {
      return res.sendStatus(404);
    }

    const imageUpdate = await updateOneProfileField(
      userProfile.id,
      "image_" + imageNumber,
      key
    );
    if (!imageUpdate) {
      return res.sendStatus(404);
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const getContactStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const requestedId = req.query.requestedId;
    const userProfile = await getProfileByUserId(userProfileId);
    if (!userProfile) {
      return res.sendStatus(404);
    }

    // @ts-ignore
    const response = await getContactStatusService(
      Number(userProfile.id),
      Number(requestedId)
    );
    if (!response) {
      return res.sendStatus(404);
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const deleteImageController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const imageNumber = req.query.image;
    const userProfile = await getProfileByUserId(String(userProfileId));

    if (!userProfile) {
      return res.sendStatus(404);
    }

    const imageKey = "image_" + imageNumber;
    // @ts-ignore
    const imagePath = userProfile[imageKey];

    const response = await deleteAwsFileService(imagePath);
    if (!response) {
      return res.sendStatus(404);
    }

    const imageUpdate = await updateOneProfileField(
      userProfile.id,
      "image_" + imageNumber,
      null
    );
    if (!imageUpdate) {
      return res.sendStatus(404);
    }

    res.json({ message: "Image Deleted" });
  } catch (err) {
    next(err);
  }
};

export const getNotificationTypeCountsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const userProfile = await getProfileByUserId(userProfileId);
    if (!userProfile) {
      return res.sendStatus(404);
    }

    // @ts-ignore
    const response = await getNotificationTypeCountsService(Number(userProfile.id));
    if (!response) {
      return res.sendStatus(404);
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const getViewNotificationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    const pageNumber = req.params.page;
    const userProfile = await getProfileByUserId(String(userProfileId));
    if (!userProfile) {
      return res.sendStatus(404);
    }

    const response = await getViewNotificationService(
      Number(pageNumber),
      userProfile.id
    );
    if (!response) {
      return res.sendStatus(404);
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
};

export const getValidUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // @ts-ignore
    const response = await getUserRecord(req.user.userId);
    if (!response) {
      return res.sendStatus(404);
    }
    return res.status(200).json({ is_valid: true });
  } catch (err) {
    next(err);
  }
};
