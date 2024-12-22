import { Request, Response } from "express";
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

export const saveProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userRecord = await getUserRecord(req.user.userId);

    if (!userRecord) {
      return res.status(400).json({ message: "Something went wrong" });
    }

    const createdProfile = await saveProfileByUserId(req.body, userRecord.id);

    if (!createdProfile) {
      res.status(400).json({ message: "Something went wrong" });
    }

    if (userRecord?.is_profile_complete) {
      return res.status(201).json({ message: "Profile Updated Successfully" });
    }
    const now = new Date();
    //

    // const payload = {
    //   // @ts-ignore
    //   userId: req.user.userId,
    //   isProfileCompleted: true,
    //   isActive:
    //     !userRecord.expires_at || userRecord.expires_at < now ? false : true,
    // };

    // const token = generateAccessToken(payload);
    // const refreshToken = generateRefreshToken(payload);

    // await prisma.refreshToken.create({
    //   data: {
    //     token: refreshToken,
    //     user_id: payload.userId,
    //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    //   },
    // });

    // await prisma.refreshToken.upsert({
    //   where: { user_id: payload.userId },
    //   update: {
    //     token: refreshToken,
    //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    //   },
    //   create: {
    //     token: refreshToken,
    //     user_id: payload.userId,
    //     expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    //   },
    // });

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "strict",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    //   path: "/",
    //   // domain: ".kovaikongumatrimony.com",
    //   domain: getCookieDomain(),
    //   // domain: "192.168.29.126",
    // });
    await setUserClaims(userRecord.id, {
      userId: userRecord.id,
      isProfileCompleted: true,
    });

    res.status(200).json({ message: "Created" });
    // res.status(200).json({ token, refreshToken });

    /////
    /* const token = generateAccessToken({
      // @ts-ignore
      userId: req.user.userId,
      isProfileCompleted: true,
      isActive:
        !userRecord.expires_at || userRecord.expires_at < now ? false : true,
    }); */

    // return res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  // enable later
  const id = parseInt(req.params.id, 10);
  // const id = 1;
  // @ts-ignore
  const userId = req.user.userId;
  const userProfile = await getProfileByUserId(userId);
  if (!userProfile) {
    return res.status(404).json({ error: "User profile not found" });
  }

  try {
    const profile = await getProfileById(id, userProfile.id);
    if (profile) {
      res.status(200).json(profile);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const id = req.user.userId;
    const profile = await getProfileByUserId(id);
    console.log("profileprofile", profile);
    if (profile) {
      return res.status(200).json(profile);
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ error });
  }
};

export const getSuggestedProfiles = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    // @ts-ignore
    // const id = req.params.page;
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
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const postRegularSearchController = async (
  req: Request,
  res: Response
) => {
  try {
    const response = await regularSearchProfileService(req.body);
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getRequestSentController = async (req: Request, res: Response) => {
  console.log("getRequestSentController");
  // @ts-ignore
  const userProfileId = req.user.userId;

  const status = req.query.status;
  // @ts-ignore
  // const id = req.params.page;
  const userProfile = await getProfileByUserId(Number(userProfileId));

  // @ts-ignore
  const response = await getRequestSentService(userProfile.id, status);
  if (!response) {
    return res.sendStatus(404);
  }

  res.json(response);
};

export const postSendRequestController = async (
  req: Request,
  res: Response
) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;

    // @ts-ignore
    const userProfile = await getProfileByUserId(Number(userProfileId));

    const requestedTo = req.body.requested_to;

    // @ts-ignore
    const requestedBy = userProfile.id;

    const response = await postSendRequestService(requestedBy, requestedTo);
    res.status(201).json(response);
  } catch (error) {
    console.error("Error in Request creation:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      if (error.code === "P2002") {
        return res.status(409).json({ error: "Already sent Request" });
      }
    }

    // For other types of errors, send a generic error message
    res.status(500).json({
      error: "An error occurred while sending request for the profile.",
    });
  }
};

export const postShortlistController = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;

    // @ts-ignore
    const userProfile = await getProfileByUserId(Number(userProfileId));

    const requestedTo = req.body.requested_to;

    // @ts-ignore
    const requestedBy = userProfile.id;

    const response = await postShortlistService(requestedBy, requestedTo);
    res.status(201).json(response);
  } catch (error) {
    console.error("Error in shortlist creation:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle known Prisma errors
      if (error.code === "P2002") {
        return res
          .status(409)
          .json({ error: "This profile is already shortlisted." });
      }
    }

    // For other types of errors, send a generic error message
    res
      .status(500)
      .json({ error: "An error occurred while shortlisting the profile." });
  }
};

export const deleteShortlistController = async (
  req: Request,
  res: Response
) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;

    // @ts-ignore
    const userProfile = await getProfileByUserId(Number(userProfileId));

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
    return res.status(500);
  } catch (error) {
    return res.status(500);
  }
};

export const postPhoneNumberController = async (
  req: Request,
  res: Response
) => {
  // @ts-ignore
  const userProfileId = req.user.userId;

  // @ts-ignore
  const userProfile = await getProfileByUserId(Number(userProfileId));

  const requestedTo = req.body.requested_to;

  // @ts-ignore
  const requestedBy = userProfile.id;

  const response = await postPhoneNumberService(requestedBy, requestedTo);

  res.json(response);
};

export const getRequestReceivedController = async (
  req: Request,
  res: Response
) => {
  console.log("getRequestReceivedController");
  // @ts-ignore
  const userProfileId = req.user.userId;

  const status = req.query.status;
  // @ts-ignore
  // const id = req.params.page;
  const userProfile = await getProfileByUserId(Number(userProfileId));

  // @ts-ignore
  const response = await getRequestReceivedService(userProfile.id, status);
  if (!response) {
    return res.sendStatus(404);
  }

  res.json(response);
};

export const postAcceptRequestController = async (
  req: Request,
  res: Response
) => {
  // @ts-ignore
  const userProfileId = req.user.userId;

  // @ts-ignore
  const userProfile = await getProfileByUserId(Number(userProfileId));

  const requestedBy = req.body.requested_by;

  // @ts-ignore
  const acceptedBy = userProfile.id;

  console.log("object", acceptedBy, requestedBy);

  const response = await postAcceptRequestService(requestedBy, acceptedBy);

  res.json(response);
};

export const postDeclineRequestController = async (
  req: Request,
  res: Response
) => {
  // @ts-ignore
  const userProfileId = req.user.userId;

  // @ts-ignore
  const userProfile = await getProfileByUserId(Number(userProfileId));

  const requestedBy = req.body.requested_by;

  // @ts-ignore
  const declinedBy = userProfile.id;

  const response = await postDeclineRequestService(requestedBy, declinedBy);

  res.json(response);
};

export const getShortlistedController = async (req: Request, res: Response) => {
  // @ts-ignore
  const userProfileId = req.user.userId;

  const status = req.query.status;
  // @ts-ignore
  // const id = req.params.page;
  const userProfile = await getProfileByUserId(Number(userProfileId));

  // @ts-ignore
  const response = await getShortlistedService(userProfile.id);
  if (!response) {
    return res.sendStatus(404);
  }

  res.json(response);
};

export const getPresignedUrlController = async (
  req: Request,
  res: Response
) => {
  // @ts-ignore
  const userProfileId = req.user.userId;

  const imageNumber = req.query.image;
  // @ts-ignore
  // const id = req.params.page;
  const userProfile = await getProfileByUserId(Number(userProfileId));

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
  console.log("imageUpdate ", imageUpdate);
  if (!imageUpdate) {
    return res.sendStatus(404);
  }

  res.json(response);
};

export const getContactStatusController = async (
  req: Request,
  res: Response
) => {
  // @ts-ignore
  const userProfileId = req.user.userId;

  const requestedId = req.query.requestedId;
  // @ts-ignore
  // const id = req.params.page;
  const userProfile = await getProfileByUserId(Number(userProfileId));
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
};

export const deleteImageController = async (req: Request, res: Response) => {
  // @ts-ignore
  const userProfileId = req.user.userId;

  const imageNumber = req.query.image;
  // @ts-ignore
  // const id = req.params.page;
  const userProfile = await getProfileByUserId(Number(userProfileId));

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
};

export const getNotificationTypeCountsController = async (
  req: Request,
  res: Response
) => {
  // @ts-ignore
  const userProfileId = req.user.userId;

  // const requestedId = req.query.requestedId;
  // @ts-ignore
  // const id = req.params.page;
  const userProfile = await getProfileByUserId(userProfileId);
  if (!userProfile) {
    return res.sendStatus(404);
  }

  // @ts-ignore
  const response = await getNotificationTypeCountsService(
    Number(userProfile.id)
  );
  if (!response) {
    return res.sendStatus(404);
  }

  res.json(response);
};

export const getViewNotificationController = async (
  req: Request,
  res: Response
) => {
  // @ts-ignore
  const userProfileId = req.user.userId;

  const pageNumber = req.params.page;

  // const requestedId = req.query.requestedId;
  // @ts-ignore
  // const id = req.params.page;
  const userProfile = await getProfileByUserId(Number(userProfileId));
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
};
