import { z } from "zod";

export const validateOtpSchema = z.object({
  otp: z.string().min(4).max(10),
  mobile_number: z.string().refine((value) => /^\d{10}$/.test(value), {
    message: "Invalid mobile number format. Must be 10 digits.",
  }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long." })
    .max(100, { message: "Password must be no longer than 100 characters." })
    .regex(/[A-Z]/, {
      message: "Password must contain at least one uppercase letter.",
    })
    .regex(/[a-z]/, {
      message: "Password must contain at least one lowercase letter.",
    })
    .regex(/\d/, { message: "Password must contain at least one number." })
    .regex(/[@$!%*?&]/, {
      message: "Password must contain at least one special character.",
    }),
});

export type ValidateOtpSchema = z.infer<typeof validateOtpSchema>;
