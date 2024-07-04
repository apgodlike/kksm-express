import { z } from "zod";
import {
  AnnualIncome,
  EmploymentType,
  Gender,
  MaritalStatus,
  PhysicalStatus,
  RelationshipType,
} from "@prisma/client";

export const profileSchema = z.object({
  profile_for: z.nativeEnum(RelationshipType),
  name: z.string().min(1).max(100),
  date_of_birth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date of birth must be in YYYY-MM-DD format",
  }),
  education: z.string().optional(),
  location: z.string().optional(), // Adjust max length as per your requirements
  gender: z.nativeEnum(Gender),
  kulam: z.string().min(1).max(100), // Adjust max length as per your requirements
  mother_tongue: z.string().optional(),
  height: z.string().optional(), // Adjust max length as per your requirements
  marital_status: z.nativeEnum(MaritalStatus).optional(),
  physical_status: z.nativeEnum(PhysicalStatus).optional(),
  number_of_brothers: z.number().int().optional(),
  number_of_brothers_married: z.number().int().optional(),
  number_of_sisters: z.number().int().optional(),
  number_of_sisters_married: z.number().int().optional(),
  father_occupation: z.string().optional(),
  mother_occupation: z.string().optional(),
  employment_type: z.nativeEnum(EmploymentType).optional(),
  employed_in: z.string().optional(),
  annual_income: z.nativeEnum(AnnualIncome).optional(),
  image_1: z.string().nullable().optional(), // Adjust max length as per your requirements
  image_2: z.string().nullable().optional(),
  image_3: z.string().nullable().optional(),
  image_4: z.string().nullable().optional(),
  image_horoscope: z.string().nullable().optional(),
});

// This type can be used for type checking in your controller/service
export type ProfileInput = z.infer<typeof profileSchema>;
