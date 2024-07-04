import prisma from "../utils/prisma";
import { Profile } from "@prisma/client";

export const getSuggestedProfiles = async () => {
  await prisma.profile.findMany({
    where: {},
  });
};

export const saveProfileByUserId = async (
  payload: any,
  user_id: Number
): Promise<Profile | null> => {
  //   const {
  //     profile_for,
  //     name,
  //     date_of_birth,
  //     education,
  //     location,
  //     gender,
  //     kulam,
  //     mother_tongue,
  //     height,
  //     marital_status,
  //     physical_status,
  //     number_of_brothers,
  //     number_of_brothers_married,
  //     number_of_sisters,
  //     number_of_sisters_married,
  //     father_occupation,
  //     mother_occupation,
  //     employment_type,
  //     employed_in,
  //     annual_income,
  //     image_1,
  //     image_2,
  //     image_3,
  //     image_4,
  //     image_horoscope,
  //   } = payload;
  return await prisma.$transaction(async (tx) => {
    const profile = await tx.profile.update({
      where: {
        // @ts-ignore
        user_id,
      },
      data: payload,
      include: {
        user: true,
      },
    });
    return profile;
  });
};

export const getProfileById = async (id: number): Promise<Profile | null> => {
  return await prisma.profile.findUnique({
    where: { user_id: id },
  });
};
