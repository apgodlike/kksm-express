import { z } from "zod";

export const emailSchema = z.object({
  //   email: z.string().email(),
  //   password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof emailSchema>;
