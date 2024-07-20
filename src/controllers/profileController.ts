import { Request, Response } from "express";
import {
  getProfileById,
  getProfileByUserId,
  getRequestSentService,
  getSuggestedProfilesService,
  postSendRequestService,
  saveProfileByUserId,
} from "../services/profileService";
import { regularSearchProfileService } from "../services/regularSearchService";

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
      userProfile.gender
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
    return res.status(404).send(response);
  }

  res.json(response);
};

export const postSendRequestController = async (
  req: Request,
  res: Response
) => {
  // @ts-ignore
  const userProfileId = req.user.userId;

  // @ts-ignore
  const userProfile = await getProfileByUserId(Number(userProfileId));

  const requestedTo = req.body.requested_to;

  // @ts-ignore
  const requestedBy = requested_to.id;

  const response = await postSendRequestService(requestedBy, requestedTo);
};
