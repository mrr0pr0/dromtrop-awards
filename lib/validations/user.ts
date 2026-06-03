import { z } from "zod";

export const userStatusSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["approved", "rejected", "pending"]),
});

export const userRoleSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "producer", "admin"]),
});

export const approvedEmailSchema = z.object({
  email: z.string().email("Ugyldig e-postadresse"),
});
