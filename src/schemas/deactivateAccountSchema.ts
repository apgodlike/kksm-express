import { z } from "zod";

export const deactivateAccountSchema = z.object({
  deeactivate_account: z.boolean(),
});
