import { z } from "zod";

export const mobileOtpSchema = z.object({
  mobile_number: z
    .number()
    .refine((val) => val >= 1000000000 && val <= 9999999999, {
      message: "Mobile number must be a 10-digit number",
    }),
});

export type MobileOtpSchema = z.infer<typeof mobileOtpSchema>;
