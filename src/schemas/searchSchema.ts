import { z } from "zod";

export const regularSearchSchema = z.object({
  age_from: z.string(),
  age_to: z.string(),
  recent_profile: z.string(),
  location: z.string(),
});
