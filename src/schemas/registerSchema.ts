import { z } from "zod";
import { Gender, RelationshipType } from "@prisma/client";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  profile_for: z.nativeEnum(RelationshipType),
  name: z.string().min(2).max(100),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date of birth must be in YYYY-MM-DD format",
  }),
  gender: z.nativeEnum(Gender),
  mobile_number: z.string().refine((value) => /^\d{10}$/.test(value), {
    message: "Invalid mobile number format. Must be 10 digits.",
  }),
  kulam: z.string().min(1).max(100), // Adjust max as per your requirements
  otp: z.string(),
});

// This type can be used for type checking in your controller/service
export type RegisterInput = z.infer<typeof registerSchema>;
