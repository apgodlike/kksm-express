import { PrismaClient, Gender, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

interface SearchParams {
  ageFrom?: number;
  ageTo?: number;
  location?: string;
  gender: Gender;
  page: number;
  pageSize: number;
}

interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export const regularSearchProfileService = async (
  params: SearchParams
): Promise<PaginatedResult<any>> => {
  const { ageFrom, ageTo, location, gender, page, pageSize } = params;

  // Calculate date range for age
  const currentDate = new Date();
  const fromDate = ageTo
    ? new Date(
        currentDate.getFullYear() - ageTo,
        currentDate.getMonth(),
        currentDate.getDate()
      )
    : undefined;
  const toDate = ageFrom
    ? new Date(
        currentDate.getFullYear() - ageFrom,
        currentDate.getMonth(),
        currentDate.getDate()
      )
    : undefined;

  // Determine opposite gender
  const oppositeGender = gender === Gender.Male ? Gender.Female : Gender.Male;

  try {
    // Create the where clause
    const whereClause: Prisma.ProfileWhereInput = {
      gender: oppositeGender,
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
      include: {
        user: {
          select: {
            email: true,
            mobile_number: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    // Calculate age for each profile
    const profilesWithAge = profiles.map((profile) => ({
      ...profile,
      age: calculateAge(profile.date_of_birth),
    }));

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

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

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
