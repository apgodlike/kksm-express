import { Request, Response } from "express";
import {
  getProfileById,
  saveProfileByUserId,
} from "../services/profileService";

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
  // const id = parseInt(req.params.id, 10);
  const id = 1;
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
  /// @ts-ignore
  const id = req.user.userId;
  console.log("objectUser");
  console.log(id);
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
