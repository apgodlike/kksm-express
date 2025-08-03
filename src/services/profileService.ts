import { ProfilesResponse } from "../types";
import prisma from "../utils/prisma";
import { Gender, NotificationType, Profile } from "@prisma/client";
import { calculateAge } from "./regularSearchService";
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { notDeepEqual } from "assert";

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
  payload: Profile,
  user_id: string
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
    const userProfile = await tx.user.update({
      where: { id: user_id },
      data: {
        is_profile_complete: true,
      },
    });

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
): Promise<Omit<Profile, "contact_name" | "contact_number"> | null> => {
  const response = await prisma.profile.findUnique({
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
  if (!response) {
    return null;
  }

  const { contact_name, contact_number, ...otherProperties } = response;

  return otherProperties;
};

export const getProfileByUserId = async (
  id: string
): Promise<Profile | null> => {
  const response = await prisma.profile.findUnique({
    where: { user_id: id },
  });

  return response;
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
      employed_in: true,
      location: true,
      image_1: true,
      image_2: true,
      image_3: true,
      image_4: true,
      contact_requested_to: {
        where: {
          OR: [{ requested_by: profileId }, { requested_to: profileId }],
        },
        select: { is_accepted: true, is_declined: true },
      },
      contact_requested_by: {
        where: {
          OR: [{ requested_by: profileId }, { requested_to: profileId }],
        },
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

  const filteredProfiles = profiles.filter((item) => {
    if (
      item.contact_requested_to[0]?.is_accepted ||
      item.contact_requested_by[0]?.is_accepted
    ) {
      return true;
    }
    if (
      item.contact_requested_to[0]?.is_declined ||
      item.contact_requested_by[0]?.is_declined
    ) {
      return false;
    }
    return true;
  });

  const modifiedProfiles = filteredProfiles.map((item) => {
    return {
      id: item.id,
      name: item.name,
      date_of_birth: item.date_of_birth,
      age: calculateAge(item.date_of_birth),
      kulam: item.kulam,
      education: item.education,
      employment_type: item.employment_type,
      is_accepted:
        item.contact_requested_to[0]?.is_accepted ||
        item.contact_requested_by[0]?.is_accepted,
      is_declined: item.contact_requested_to[0]?.is_declined,
      is_requested: item.contact_requested_to.length === 1 ? true : undefined,
      is_shortlisted: item.shortlisted_profiles[0]?.shortlisted_at,
      is_requested_to_my_profile:
        item.contact_requested_by.length === 1 ? true : undefined,
      is_accepted_by_my_profile: item.contact_requested_by[0]?.is_accepted,
      image_1: item.image_1,
      image_2: item.image_2,
      image_3: item.image_3,
      image_4: item.image_4,
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
          kulam: true,
          image_1: true,
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
    age: calculateAge(contact.requested_to_profile.date_of_birth),
    marital_status: contact.requested_to_profile.marital_status,
    location: contact.requested_to_profile.location,
    employment_type: contact.requested_to_profile.employment_type,
    education: contact.requested_to_profile.education,
    height: contact.requested_to_profile.height,
    kulam: contact.requested_to_profile.kulam,
    image_1: contact.requested_to_profile.image_1,
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
    const response = await prisma.$transaction(async (x) => {
      const response = await x.contact.create({
        data: {
          requested_by: requestedBy,
          requested_to: requestedTo,
          is_accepted: false,
          is_declined: false,
        },
        include: { requested_by_profile: true, requested_to_profile: true },
      });
      await x.notification.create({
        data: {
          notification_type: NotificationType.RequestReceived,
          profile_id: requestedTo,
          sent_profile_id: requestedBy,
        },
      });
      return response;
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
    const response = prisma.$transaction(async (x) => {
      const response = await x.contact.update({
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
      await x.notification.create({
        data: {
          notification_type: NotificationType.RequestAccepted,
          profile_id: requestedBy,
          sent_profile_id: acceptedBy,
        },
      });
      return response;
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
    const response = prisma.$transaction(async (x) => {
      const response = await x.contact.update({
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
      await x.notification.create({
        data: {
          notification_type: NotificationType.RequestDeclined,
          profile_id: requestedBy,
          sent_profile_id: declinedBy,
        },
      });
      return response;
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
        OR: [
          { requested_by: requestedBy, requested_to: requestedTo },
          { requested_by: requestedTo, requested_to: requestedBy },
        ],
        is_accepted: true,
      },
    });

    if (!isAuthorized) {
      return { message: "unAuthorized" };
    }

    // const response = await prisma.profile.findFirst({
    //   where: {
    //     id: requestedTo,
    //   },
    //   select: {
    //     contact_name: true,
    //     contact_number: true,
    //   },
    // });

    const response = await prisma.$transaction(async (x) => {
      const response = await x.profile.findFirst({
        where: {
          id: requestedTo,
        },
        select: {
          contact_name: true,
          contact_number: true,
        },
      });

      await x.notification.create({
        data: {
          notification_type: NotificationType.PhoneNumberView,
          profile_id: requestedTo,
          sent_profile_id: requestedBy,
        },
      });

      return response;
    });

    const mobile_number = response?.contact_number?.toString();
    const contact_name = response?.contact_name?.toString();
    return { contact_name, mobile_number };
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
          kulam: true,
          image_1: true,
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

export const getPresignedUrlService = async (key: string) => {
  const command = new PutObjectCommand({
    Bucket: "decenteralized-fiver-web3",
    Key: key,
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

export const deleteAwsFileService = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: "decenteralized-fiver-web3",
    Key: key,
  });
  try {
    const response = await client.send(command);
    return response;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

export const getContactStatusService = async (
  requestedBy: number,
  requestedTo: number
) => {
  try {
    const contactStatus = await prisma.contact.findFirst({
      where: {
        OR: [
          {
            requested_by: requestedBy,
            requested_to: requestedTo,
          },
          {
            requested_by: requestedTo,
            requested_to: requestedBy,
          },
        ],
      },
      select: {
        is_accepted: true,
        is_declined: true,
        requested_by: true,
        requested_to: true,
      },
    });

    const shortlistStatus = await prisma.shortlist.findFirst({
      where: {
        shortlisted_by: requestedBy,
        shortlisted_profile: requestedTo,
      },
    });
    console.log("contactStatus?.requested_by, ", contactStatus?.requested_by);

    const is_requested_to_my_profile = () => {
      if (
        !contactStatus?.requested_by ||
        contactStatus?.requested_by === requestedBy
      ) {
        return false;
      }
      return true;
    };

    const response = {
      is_shortlisted: shortlistStatus ? true : false,
      is_requested: contactStatus ? true : false,
      is_accepted: contactStatus?.is_accepted,
      is_declined: contactStatus?.is_declined,
      is_requested_to_my_profile: is_requested_to_my_profile(),
      requested_by: contactStatus?.requested_by,
      requested_to: contactStatus?.requested_to,
    };

    return response;
  } catch (error) {
    return error;
  }
};

// userProfile,
// Number(imageNumber),
// "/" + key

export const updateOneProfileField = async (
  userProfile: number,
  path: string,
  value: string | null
) => {
  try {
    const response = await prisma.profile.update({
      where: { id: userProfile },
      data: { [path]: value },
    });
    return response;
  } catch (error) {
    return error;
  }
};

type NotificationTypeCounts = {
  [key in NotificationType]: number;
} & {
  totalCount: number;
};

export const getNotificationTypeCountsService = async (
  profileId: number
): Promise<NotificationTypeCounts> => {
  try {
    const latestRecord = await prisma.notification.findFirst({
      orderBy: {
        timestamp: "desc",
      },
    });

    // Initialize the result object with all types set to 0
    const formattedCounts: NotificationTypeCounts = {
      RequestReceived: 0,
      RequestAccepted: 0,
      RequestDeclined: 0,
      ProfileView: 0,
      PhoneNumberView: 0,
      totalCount: 0,
    };

    if (!latestRecord) {
      console.log("No records found");
      return formattedCounts;
    }

    if (latestRecord.is_viewed) {
      console.log("Latest record has x field as true");
      return formattedCounts;
    }

    const counts = await prisma.notification.groupBy({
      where: { profile_id: profileId },
      by: ["notification_type"],
      _count: {
        notification_type: true,
      },
    });

    // Update counts based on the query result
    counts.forEach((item) => {
      formattedCounts[item.notification_type] = item._count.notification_type;
      formattedCounts.totalCount += item._count.notification_type;
    });

    console.log("Notification Type Counts:", formattedCounts);
    return formattedCounts;
  } catch (error) {
    console.error("Error fetching notification type counts:", error);
    throw error;
  }
};

export const getViewNotificationService = async (
  page: number,
  profileId: number
) => {
  const pageSize = 10;
  const skip = (page - 1) * pageSize;
  try {
    const response = await prisma.$transaction(async (x) => {
      const response = await x.notification.findMany({
        where: {
          profile_id: profileId,
        },
        include: {
          sent_profile: {
            select: {
              name: true,
              image_1: true,
              id: true,
            },
          },
        },
        orderBy: { timestamp: "desc" },
        skip: skip,
        take: pageSize,
      });

      await x.notification.updateMany({
        where: {
          profile_id: profileId,
          id: { in: response.map((item) => item.id) },
        },
        data: {
          is_viewed: true,
          viewed_at: new Date(Date.now()),
        },
      });
      return response;
    });

    return response;
  } catch (error) {
    console.error("Error fetching notification type counts:", error);
    throw error;
  }
};
