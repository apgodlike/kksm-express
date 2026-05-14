import { z } from "zod";
import { Gender, RelationshipType } from "@prisma/client";

export const registerSchema = z.object({
  // email: z.string().email(),
  // password: z
  //   .string()
  //   .min(8, { message: "Password must be at least 8 characters long." })
  //   .max(100, { message: "Password must be no longer than 100 characters." })
  //   .regex(/[A-Z]/, {
  //     message: "Password must contain at least one uppercase letter.",
  //   })
  //   .regex(/[a-z]/, {
  //     message: "Password must contain at least one lowercase letter.",
  //   })
  //   .regex(/\d/, { message: "Password must contain at least one number." })
  //   .regex(/[@$!%*?&]/, {
  //     message: "Password must contain at least one special character.",
  //   }),

  profile_for: z.nativeEnum(RelationshipType),
  name: z.string().min(2).max(100),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date of birth must be in YYYY-MM-DD format",
  }),
  gender: z.nativeEnum(Gender),
  mobile_number: z.string().regex(/^\d{10}$/, {
    message: "Mobile number must be exactly 10 digits",
  }),
  kulam: z.string().min(1).max(100),
  // otp: z.string(),
});

// This type can be used for type checking in your controller/service
export type RegisterInput = z.infer<typeof registerSchema>;
