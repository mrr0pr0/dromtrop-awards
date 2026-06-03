import { getSql } from "./client";
import type { ApprovedEmail } from "@/types";

export async function isEmailApproved(email: string): Promise<boolean> {
  const sql = getSql();
  const rows = await sql`
    SELECT 1 FROM approved_emails WHERE LOWER(email) = LOWER(${email}) LIMIT 1
  `;
  return rows.length > 0;
}

export async function listApprovedEmails(): Promise<ApprovedEmail[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, email, created_at FROM approved_emails ORDER BY email ASC
  `;
  return rows as ApprovedEmail[];
}

export async function addApprovedEmail(email: string): Promise<ApprovedEmail> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO approved_emails (email) VALUES (${email.toLowerCase()})
    RETURNING id, email, created_at
  `;
  return rows[0] as ApprovedEmail;
}

export async function removeApprovedEmail(id: number): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM approved_emails WHERE id = ${id}`;
}
