import { Profile } from "@prisma/client";

export interface ProfilesResponse {
  profiles: Pick<
    Profile,
    "name" | "date_of_birth" | "kulam" | "education" | "employment_type" | "id"
  >[];
  currentPage: number;
  totalPages: number;
}
