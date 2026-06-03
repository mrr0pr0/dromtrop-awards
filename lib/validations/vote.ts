import { z } from "zod";

export const voteSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  nomineeId: z.coerce.number().int().positive(),
});

export type VoteInput = z.infer<typeof voteSchema>;
