import { Request, Response } from "express";
import {
  deleteShortlistService,
  getProfileById,
  getProfileByUserId,
  getRequestReceivedService,
  getRequestSentService,
  getSuggestedProfilesService,
  postAcceptRequestService,
  postDeclineRequestService,
  postPhoneNumberService,
  postSendRequestService,
  postShortlistService,
  saveProfileByUserId,
} from "../services/profileService";
import { regularSearchProfileService } from "../services/regularSearchService";
import { Prisma } from "@prisma/client";

export const saveProfile = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const createdProfile = await saveProfileByUserId(req.body, req.user.userId);
    if (!createdProfile) {
      res.status(400).json({ message: "Something went wrong" });
    }
    res.status(200).json({ message: "created" });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  // enable later
  const id = parseInt(req.params.id, 10);
  // const id = 1;
  try {
    const profile = await getProfileById(id);
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
    if (profile) {
      res.status(200).json(profile);
    } else {
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

export const getSuggestedProfiles = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userProfileId = req.user.userId;
    // @ts-ignore
    // const id = req.params.page;
    const userProfile = await getProfileByUserId(Number(userProfileId));
    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    const page = Number(req.params.page);
    console.log("111");
    console.log(req.params);
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
  console.log("getRequestSentController");
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
