import { Request, Response } from "express";
import { Gender } from "@prisma/client";
import { regularSearchProfileService } from "../services/regularSearchService";
import { RegularSearchParams, ProfilesResponse } from "../types";
import {
  getOppositeGender,
  getProfileByUserId,
} from "../services/profileService";

export const regularSearchController = async (req: Request, res: Response) => {
  try {
    // Extract and transform the data
    const { age_from, age_to, location, recent_profile, page_size } =
      req.body.searchTerm;

    const pageNumber = Number(req.params.page);

    // @ts-ignore
    const profile = await getProfileByUserId(req.user.userId);

    if (!profile) {
      return res.send(404).json({ msg: "error" });
    }

    const oppositeGender = getOppositeGender(profile.gender);

    if (!oppositeGender) {
      return res.status(400).json({ msg: "Invalid gender" });
    }

    // Prepare the params for the service
    const searchParams: RegularSearchParams = {
      age_from: age_from ? Number(age_from) : undefined,
      age_to: age_to ? Number(age_to) : undefined,
      location,
      recent_profile,
      gender: oppositeGender,
      page: pageNumber ? Number(req.params.page) : 1,
      page_size: page_size ? Number(page_size) : 10,
      profileId: profile.id,
    };

    // Call the service
    const result = await regularSearchProfileService(searchParams);

    // Transform the result if necessary
    const response: ProfilesResponse = {
      profiles: result.data,
      currentPage: result.currentPage,
      totalPages: result.totalPages,
    };

    // Send the response
    res.json(response);
  } catch (error) {
    console.error("Error in regularSearchController:", error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unexpected error occurred" });
    }
  }
};
