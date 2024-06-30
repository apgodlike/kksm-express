import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../utils/prisma";
import dotenv from "dotenv";

export const saveProfile = async (req: Request, res: Response) => {
  const {
    profile_for,
    name,
    date_of_birth,
    education,
    location,
    gender,
    kulam,
    mother_tongue,
    height,
    marital_status,
    physical_status,
    number_of_brothers,
    number_of_brothers_married,
    number_of_sisters,
    number_of_sisters_married,
    father_occupation,
    mother_occupation,
    employment_type,
    employed_in,
    annual_income,
    image_1,
    image_2,
    image_3,
    image_4,
    image_horoscope,
  } = req.body;
  try {
    const createdProfile = await prisma.$transaction(async (tx) => {
      const profile = await tx.profile.update({
        where: {
          // @ts-ignore
          user_id: req.user.userId,
        },
        data: {
          profile_for,
          name,
          date_of_birth,
          education,
          location,
          gender,
          kulam,
          mother_tongue,
          height,
          marital_status,
          physical_status,
          number_of_brothers,
          number_of_brothers_married,
          number_of_sisters,
          number_of_sisters_married,
          father_occupation,
          mother_occupation,
          employment_type,
          employed_in,
          annual_income,
          image_1,
          image_2,
          image_3,
          image_4,
          image_horoscope,
        },
        include: {
          user: true,
        },
      });
      return profile;
    });
    if (!createdProfile) {
      res.status(400).json({ message: "Something went wrong" });
    }
    res.status(200).json({ message: "created" });
  } catch (error) {
    res.status(500).json({ error });
  }
};
