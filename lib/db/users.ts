import { getSql } from "./client";
import type { User, UserRole, UserStatus } from "@/types";

export async function findUserByEmail(email: string): Promise<User | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, email, role, status, created_at
    FROM users WHERE LOWER(email) = LOWER(${email}) LIMIT 1
  `;
  return (rows[0] as User) ?? null;
}

export async function findUserById(id: string): Promise<User | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, email, role, status, created_at
    FROM users WHERE id = ${id} LIMIT 1
  `;
  return (rows[0] as User) ?? null;
}

export async function upsertUserOnSignIn(params: {
  id: string;
  email: string;
  name?: string | null;
  status: UserStatus;
}): Promise<User> {
  const sql = getSql();
  const bootstrapAdmin = process.env.BOOTSTRAP_ADMIN_EMAIL?.toLowerCase();
  const role: UserRole =
    bootstrapAdmin && params.email.toLowerCase() === bootstrapAdmin
      ? "admin"
      : "user";

  const rows = await sql`
    INSERT INTO users (id, email, name, status, role)
    VALUES (${params.id}, ${params.email.toLowerCase()}, ${params.name ?? null}, ${params.status}, ${role})
    ON CONFLICT (email) DO UPDATE SET
      name = COALESCE(EXCLUDED.name, users.name),
      status = EXCLUDED.status
    RETURNING id, name, email, role, status, created_at
  `;
  return rows[0] as User;
}

export async function listUsers(): Promise<User[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, email, role, status, created_at
    FROM users ORDER BY created_at DESC
  `;
  return rows as User[];
}

export async function listPendingUsers(): Promise<User[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, email, role, status, created_at
    FROM users WHERE status = 'pending' ORDER BY created_at DESC
  `;
  return rows as User[];
}

export async function updateUserStatus(
  id: string,
  status: UserStatus,
): Promise<User | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE users SET status = ${status} WHERE id = ${id}
    RETURNING id, name, email, role, status, created_at
  `;
  return (rows[0] as User) ?? null;
}

export async function updateUserRole(
  id: string,
  role: UserRole,
): Promise<User | null> {
  const sql = getSql();
  const rows = await sql`
    UPDATE users SET role = ${role} WHERE id = ${id}
    RETURNING id, name, email, role, status, created_at
  `;
  return (rows[0] as User) ?? null;
}

export async function countApprovedUsers(): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM users WHERE status = 'approved'
  `;
  return (rows[0] as { count: number }).count;
}

export async function countPendingUsers(): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM users WHERE status = 'pending'
  `;
  return (rows[0] as { count: number }).count;
}

export async function getRecentUsers(limit = 5): Promise<User[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, email, role, status, created_at
    FROM users ORDER BY created_at DESC LIMIT ${limit}
  `;
  return rows as User[];
}
