import { PrismaClient, Gender, Prisma } from "@prisma/client";
import { PaginatedResult, RegularSearchParams } from "../types";

const prisma = new PrismaClient();

export const regularSearchProfileService = async (
  params: RegularSearchParams
): Promise<PaginatedResult<any>> => {
  const { age_from, age_to, location, gender, page, page_size } = params;

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

    console.log("regularSearchProfileService");
    console.log(totalCount);
    // Get paginated profiles
    const profiles = await prisma.profile.findMany({
      where: whereClause,
      orderBy: {
        created_at: "desc",
      },
      include: {
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

    // Calculate age for each profile
    const profilesWithAge = profiles.map((profile) => ({
      ...profile,
      age: calculateAge(profile.date_of_birth),
    }));

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / page_size);

    return {
      data: profilesWithAge,
      totalCount,
      totalPages,
      currentPage: page,
    };
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
