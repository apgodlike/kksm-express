import { z } from "zod";

const numericString = z
  .string()
  .regex(/^\d+$/, { message: "Must be a numeric value" });

export const regularSearchSchema = z.object({
  searchTerm: z.object({
    age_from: numericString
      .refine((v) => Number(v) >= 1 && Number(v) <= 120, {
        message: "age_from must be between 1 and 120",
      })
      .optional(),
    age_to: numericString
      .refine((v) => Number(v) >= 1 && Number(v) <= 120, {
        message: "age_to must be between 1 and 120",
      })
      .optional(),
    recent_profile: z.string().max(50).optional(),
    location: z.string().max(200).optional(),
    page: numericString
      .refine((v) => Number(v) >= 1, { message: "page must be >= 1" })
      .optional(),
    page_size: numericString
      .refine((v) => Number(v) >= 1 && Number(v) <= 100, {
        message: "page_size must be between 1 and 100",
      })
      .optional(),
  }),
});

export type RegularSearchInput = z.infer<typeof regularSearchSchema>;
