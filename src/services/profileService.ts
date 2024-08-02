import { ProfilesResponse } from "../types";
import prisma from "../utils/prisma";
import { Gender, Profile } from "@prisma/client";
import { calculateAge } from "./regularSearchService";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

if (!process.env.ACCESS_KEY_ID || !process.env.SECRET_ACCESS_KEY) {
  throw new Error("AWS credentials are not set in environment variables");
}

const client = new S3Client({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  region: "ap-southeast-2",
});

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

export const getProfileById = async (
  id: number,
  userProfileId: number
): Promise<Profile | null> => {
  return await prisma.profile.findUnique({
    where: {
      id,
    },
    include: {
      contact_requested_to: {
        where: {
          requested_by: userProfileId,
        },
        select: {
          is_accepted: true,
          is_declined: true,
        },
      },
    },
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
  gender: Gender,
  profileId: number
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
      contact_requested_to: {
        where: { requested_by: profileId, is_declined: false },
        select: { is_accepted: true, is_declined: true },
      },
      shortlisted_profiles: {
        where: { shortlisted_by: profileId },
        select: { shortlisted_at: true },
      },
    },
  });

  const contactProfiles = await prisma.contact.findMany({
    where: { requested_to: profileId },
    select: { is_accepted: true, requested_by: true },
  });
  console.log("contactProfiles", contactProfiles);

  const modifiedProfiles = profiles.map((item) => {
    return {
      id: item.id,
      name: item.name,
      date_of_birth: item.date_of_birth,
      kulam: item.kulam,
      education: item.education,
      employment_type: item.employment_type,
      is_accepted: item.contact_requested_to[0]?.is_accepted,
      is_requested: item.contact_requested_to.length === 1 ? true : undefined,
      is_shortlisted: item.shortlisted_profiles[0]?.shortlisted_at,
    };
  });

  const totalProfiles = await prisma.profile.count({
    where: {
      gender: oppositeGender,
    },
  });

  return {
    profiles: modifiedProfiles,
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
          height: true,
        },
      },
      accepted_at: true,
      declined_at: true,
      requested_at: true,
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
    height: contact.requested_to_profile.height,
    accepted_at: contact.accepted_at,
    requested_at: contact.requested_at,
    declined_at: contact.declined_at,
  }));
  return transformedResponse;
};

export const postSendRequestService = async (
  requestedBy: number,
  requestedTo: number
) => {
  try {
    const response = await prisma.contact.create({
      data: {
        requested_by: requestedBy,
        requested_to: requestedTo,
        is_accepted: false, // Add this
        is_declined: false, // Add this
      },
      include: { requested_by_profile: true, requested_to_profile: true },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const postAcceptRequestService = async (
  requestedBy: number,
  acceptedBy: number
) => {
  try {
    const response = await prisma.contact.update({
      where: {
        requested_by_requested_to: {
          requested_by: requestedBy,
          requested_to: acceptedBy,
        },
      },
      data: {
        is_accepted: true,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const postDeclineRequestService = async (
  requestedBy: number,
  declinedBy: number
) => {
  try {
    const response = await prisma.contact.update({
      where: {
        requested_by_requested_to: {
          requested_by: requestedBy,
          requested_to: declinedBy,
        },
      },
      data: {
        is_declined: true,
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const postShortlistService = async (
  requestedBy: number,
  requestedTo: number
) => {
  try {
    const response = await prisma.shortlist.create({
      data: {
        shortlisted_by: requestedBy,
        shortlisted_profile: requestedTo,
      },
      include: { shortlisted_by_profile: true, shortlisted_profile_rel: true },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteShortlistService = async (
  requestedBy: number,
  requestedTo: number
) => {
  try {
    const response = await prisma.shortlist.deleteMany({
      where: {
        AND: [
          { shortlisted_by: requestedBy },
          { shortlisted_profile: requestedTo },
        ],
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

export const postPhoneNumberService = async (
  requestedBy: number,
  requestedTo: number
) => {
  try {
    const isAuthorized = await prisma.contact.findFirst({
      where: {
        requested_by: requestedBy,
        requested_to: requestedTo,
        is_accepted: true,
      },
    });

    if (!isAuthorized) {
      return { message: "unAuthorized" };
    }

    const response = await prisma.profile.findFirst({
      where: {
        id: requestedTo,
      },
      select: {
        user: {
          select: { mobile_number: true },
        },
      },
    });

    const mobile_number = response?.user.mobile_number.toString();
    return { mobile_number };
  } catch (error) {
    return error;
  }
};

export const getRequestReceivedService = async (id: number, status: string) => {
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
      requested_to: id,
      is_accepted: is_accepted,
      is_declined: is_declined,
    },
    orderBy: { requested_at: "desc" },
    select: {
      requested_by_profile: {
        select: {
          id: true,
          name: true,
          date_of_birth: true,
          marital_status: true,
          location: true,
          employment_type: true,
          education: true,
          height: true,
        },
      },
      accepted_at: true,
      declined_at: true,
      requested_at: true,
    },
  });

  const transformedResponse = response.map((contact) => ({
    id: contact.requested_by_profile.id,
    name: contact.requested_by_profile.name,
    age: calculateAge(contact.requested_by_profile.date_of_birth), // You'll need to implement this function
    marital_status: contact.requested_by_profile.marital_status,
    location: contact.requested_by_profile.location,
    employment_type: contact.requested_by_profile.employment_type,
    education: contact.requested_by_profile.education,
    height: contact.requested_by_profile.height,
    accepted_at: contact.accepted_at,
    requested_at: contact.requested_at,
    declined_at: contact.declined_at,
  }));
  return transformedResponse;
};

export const getShortlistedService = async (id: number) => {
  console.log("id", id);
  const response = await prisma.shortlist.findMany({
    where: {
      shortlisted_by: id,
    },
    orderBy: { shortlisted_at: "desc" },
    select: {
      shortlisted_profile_rel: {
        select: {
          id: true,
          name: true,
          date_of_birth: true,
          marital_status: true,
          location: true,
          employment_type: true,
          education: true,
          height: true,
        },
      },
    },
  });

  const transformedResponse = response.map((contact) => ({
    id: contact.shortlisted_profile_rel.id,
    name: contact.shortlisted_profile_rel.name,
    age: calculateAge(contact.shortlisted_profile_rel.date_of_birth), // You'll need to implement this function
    marital_status: contact.shortlisted_profile_rel.marital_status,
    location: contact.shortlisted_profile_rel.location,
    employment_type: contact.shortlisted_profile_rel.employment_type,
    education: contact.shortlisted_profile_rel.education,
    height: contact.shortlisted_profile_rel.height,
  }));
  return transformedResponse;
};

export const getPresignedUrlService = async (id: number) => {
  console.log("id", id);

  const command = new PutObjectCommand({
    Bucket: "decenteralized-fiver-web3",
    Key: `kksm/${id}/${Math.random()}/image.jpg`,
    ContentType: "img/jpg",
  });

  // import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
  // const { url, fields } = await createPresignedPost(client, {
  //   Bucket: "decenteralized-fiver-web3",
  //   Key: `kksm/${id}/${Math.random()}/image.jpg`,
  //   Conditions: [
  //     ["content-length-range", 0, 1000],
  //     ["eq", "$Content-Type", "image/jpeg"],
  //   ],
  //   Expires: 3600,
  // });
  const presignedurl = await getSignedUrl(client, command, { expiresIn: 3600 });

  return presignedurl;
};

export const getContactStatusService = async (
  requestedBy: number,
  requestedTo: number
) => {
  try {
    const contactStatus = await prisma.contact.findFirst({
      where: {
        requested_by: requestedBy,
        requested_to: requestedTo,
      },
      select: { is_accepted: true, is_declined: true },
    });

    const shortlistStatus = await prisma.shortlist.findFirst({
      where: {
        shortlisted_by: requestedBy,
        shortlisted_profile: requestedTo,
      },
    });

    // if (!currentStatus) {
    //   return { message: "unAuthorized" };
    // }

    const response = {
      is_shortlisted: shortlistStatus ? true : false,
      is_requested: contactStatus ? true : false,
      is_accepted: contactStatus?.is_accepted,
      is_declined: contactStatus?.is_declined,
    };

    return response;
  } catch (error) {
    return error;
  }
};
