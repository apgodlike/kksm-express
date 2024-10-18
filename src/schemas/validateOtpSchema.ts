import { z } from "zod";

export const validateOtpSchema = z.object({
  otp: z.string(),
  mobile_number: z.number().optional(),
  password: z.string().min(8).max(100),
});

export type ValidateOtpSchema = z.infer<typeof validateOtpSchema>;
