import { z } from "zod";

export const sendRequestSchema = z.object({
  requested_to: z.number().int(),
});
