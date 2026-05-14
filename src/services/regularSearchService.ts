import { Gender, Prisma } from "@prisma/client";
import { PaginatedResult, RegularSearchParams } from "../types";
import prisma from "../utils/prisma";

export const regularSearchProfileService = async (
  params: RegularSearchParams
): Promise<PaginatedResult<any>> => {
  const { age_from, age_to, location, gender, page, page_size, profileId } =
    params;

  // Calculate date range for age
  const currentDate = new Date();
  const fromDate = age_to
    ? new Date(
        currentDate.getFullYear() - age_to,
        currentDate.getMonth(),
        currentDate.getDate()
      )
    : undefined;
  const toDate = age_from
    ? new Date(
        currentDate.getFullYear() - age_from,
        currentDate.getMonth(),
        currentDate.getDate()
      )
    : undefined;

  try {
    // Create the where clause
    const whereClause: Prisma.ProfileWhereInput = {
      gender,
      ...(location && {
        location: {
          contains: location,
          mode: "insensitive" as Prisma.QueryMode,
        },
      }),
      ...(fromDate &&
        toDate && {
          date_of_birth: {
            gte: fromDate.toISOString().split("T")[0],
            lte: toDate.toISOString().split("T")[0],
          },
        }),
    };

    // Get total count
    const totalCount = await prisma.profile.count({ where: whereClause });

    // Get paginated profiles
    const profiles = await prisma.profile.findMany({
      where: whereClause,
      orderBy: {
        created_at: "desc",
      },
      select: {
        id: true,
        name: true,
        date_of_birth: true,
        kulam: true,
        education: true,
        employment_type: true,
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
        user: {
          select: {
            email: true,
            mobile_number: true,
          },
        },
      },
      skip: (page - 1) * page_size,
      take: page_size,
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
      where: whereClause,
    });

    return {
      data: modifiedProfiles,
      totalCount,
      totalPages: Math.ceil(totalProfiles / page_size),
      currentPage: page,
    };

    ///

    // // Calculate age for each profile
    // const profilesWithAge = profiles.map((profile) => ({
    //   ...profile,
    //   age: calculateAge(profile.date_of_birth),
    // }));

    // // Calculate total pages
    // const totalPages = Math.ceil(totalCount / page_size);

    // return {
    //   data: profilesWithAge,
    //   totalCount,
    //   totalPages,
    //   currentPage: page,
    // };
  } catch (error) {
    console.error("Error in regularSearchProfileService:", error);
    throw error;
  }
};

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
