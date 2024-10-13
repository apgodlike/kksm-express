import { z } from "zod";

export const mobileOtpSchema = z.object({
  mobile_number: z.number(),
});

export type MobileOtpSchema = z.infer<typeof mobileOtpSchema>;
