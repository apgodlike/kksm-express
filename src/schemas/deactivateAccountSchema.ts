import { z } from "zod";

export const deactivateAccountSchema = z.object({
  deactivate_account: z.boolean(),
});
