import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(1, "Navn er påkrevd"),
  description: z.string().optional().nullable(),
  is_active: z.boolean().optional().default(true),
});

export const categoryUpdateSchema = categorySchema.partial().extend({
  id: z.coerce.number().int().positive(),
});

export type CategoryInput = z.infer<typeof categorySchema>;
