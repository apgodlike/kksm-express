import { z } from "zod";

export const mobileOtpSchema = z.object({
  mobile_number: z.string().regex(/^\d{10}$/, {
    message: "Mobile number must be exactly 10 digits",
  }),
});

export type MobileOtpSchema = z.infer<typeof mobileOtpSchema>;
