import prisma from "../utils/prisma";
import { Gender, Profile } from "@prisma/client";

// export const getSuggestedProfiles = async () => {
//   await prisma.profile.findMany({
//     where: {},
//   });
// };

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
    where: { id },
  });
};

export const getProfileByUserId = async (
  id: number
): Promise<Profile | null> => {
  return await prisma.profile.findUnique({
    where: { user_id: id },
  });
};

export const getRandomTopProfiles = async (
  page: number = 1,
  pageSize: number = 10,
  gender: Gender
): Promise<
  Pick<
    Profile,
    "name" | "date_of_birth" | "kulam" | "education" | "employment_type" | "id"
  >[]
> => {
  const oppositeGender = getOppositeGender(gender);
  const skip = (page - 1) * pageSize;

  // Fetch pageSize + 1 profiles to check if there's a next page
  const profiles = await prisma.profile.findMany({
    skip: skip,
    take: pageSize + 1,
    orderBy: { created_at: "desc" },
    where: {
      gender: oppositeGender,
    },
    select: {
      id: true,
      name: true,
      date_of_birth: true,
      kulam: true,
      education: true,
      employment_type: true,
    },
  });

  // Remove the extra profile we fetched
  const hasNextPage = profiles.length > pageSize;
  const pageProfiles = profiles.slice(0, pageSize);

  // Randomize the order of the profiles
  for (let i = pageProfiles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pageProfiles[i], pageProfiles[j]] = [pageProfiles[j], pageProfiles[i]];
  }

  return pageProfiles;
};

export const getOppositeGender = (gender: Gender) => {
  return gender === Gender.Male ? Gender.Female : Gender.Male;
};
