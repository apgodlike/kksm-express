import { ProfilesResponse } from "../types";
import prisma from "../utils/prisma";
import { Gender, Profile } from "@prisma/client";
import { calculateAge } from "./regularSearchService";

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

export const getSuggestedProfilesService = async (
  page: number = 1,
  pageSize: number = 10,
  gender: Gender
): Promise<ProfilesResponse> => {
  const oppositeGender = getOppositeGender(gender);
  const skip = (page - 1) * pageSize;

  const profiles = await prisma.profile.findMany({
    skip: skip,
    take: pageSize,
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

  const totalProfiles = await prisma.profile.count({
    where: {
      gender: oppositeGender,
    },
  });

  return {
    profiles,
    currentPage: page,
    totalPages: Math.ceil(totalProfiles / pageSize),
  };
};

export const getRandomTopProfilesRemove = async (
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

export const getRequestSentService = async (id: number, status: string) => {
  let is_accepted;
  let is_declined;

  if (!status) {
    return;
  }

  const statusLower = status.toLowerCase();

  if (statusLower == "pending") {
    is_accepted = false;
    is_declined = false;
  } else if (statusLower == "accepted") {
    is_accepted = true;
    is_declined = undefined;
  } else if (statusLower == "declined") {
    is_accepted = false;
    is_declined = true;
  } else {
    return;
  }

  const response = await prisma.contact.findMany({
    where: {
      requested_by: id,
      is_accepted: is_accepted,
      is_declined: is_declined,
    },
    orderBy: { requested_at: "desc" },
    select: {
      requested_to_profile: {
        select: {
          id: true,
          name: true,
          date_of_birth: true,
          marital_status: true,
          location: true,
          employment_type: true,
          education: true,
        },
      },
      accepted_at: true,
      declined_at: true,
    },
  });
  const transformedResponse = response.map((contact) => ({
    id: contact.requested_to_profile.id,
    name: contact.requested_to_profile.name,
    age: calculateAge(contact.requested_to_profile.date_of_birth), // You'll need to implement this function
    marital_status: contact.requested_to_profile.marital_status,
    location: contact.requested_to_profile.location,
    employment_type: contact.requested_to_profile.employment_type,
    education: contact.requested_to_profile.education,
    accepted_at: contact.accepted_at,
    declined_at: contact.declined_at,
  }));
  return transformedResponse;
};

export const postSendRequestService = async (
  requestedBy: number,
  requestedTo: number
) => {
  const response = await prisma.contact.create({
    data: {
      requested_by: requestedBy,
      requested_to: requestedTo,
      is_accepted: false, // Add this
      is_declined: false, // Add this
    },
    include: { requested_by_profile: true, requested_to_profile: true },
  });
};
