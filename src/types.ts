import { Gender, Profile } from "@prisma/client";

export interface ProfilesResponse {
  profiles: Pick<
    Profile,
    "name" | "date_of_birth" | "kulam" | "education" | "employment_type" | "id"
  >[];
  currentPage: number;
  totalPages: number;
}

export interface RegularSearchParams {
  age_from?: number;
  age_to?: number;
  location?: string;
  recent_profile: string;
  gender: Gender;
  page: number;
  page_size: number;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
