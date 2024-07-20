import { z } from "zod";

export const regularSearchSchema = z.object({
  requested_to: z.number().int(),
});
