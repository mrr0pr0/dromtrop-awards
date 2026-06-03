import { getSql } from "./client";
import type { Category } from "@/types";

export async function listCategories(activeOnly = false): Promise<Category[]> {
  const sql = getSql();
  const rows = activeOnly
    ? await sql`
        SELECT id, name, description, is_active, created_at
        FROM categories WHERE is_active = true ORDER BY id ASC
      `
    : await sql`
        SELECT id, name, description, is_active, created_at
        FROM categories ORDER BY id ASC
      `;
  return rows as Category[];
}

export async function getCategoryById(id: number): Promise<Category | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, description, is_active, created_at
    FROM categories WHERE id = ${id} LIMIT 1
  `;
  return (rows[0] as Category) ?? null;
}

export async function createCategory(data: {
  name: string;
  description?: string | null;
  is_active?: boolean;
}): Promise<Category> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO categories (name, description, is_active)
    VALUES (${data.name}, ${data.description ?? null}, ${data.is_active ?? true})
    RETURNING id, name, description, is_active, created_at
  `;
  return rows[0] as Category;
}

export async function updateCategory(
  id: number,
  data: {
    name?: string;
    description?: string | null;
    is_active?: boolean;
  },
): Promise<Category | null> {
  const sql = getSql();
  const existing = await getCategoryById(id);
  if (!existing) return null;

  const rows = await sql`
    UPDATE categories SET
      name = ${data.name ?? existing.name},
      description = ${data.description !== undefined ? data.description : existing.description},
      is_active = ${data.is_active ?? existing.is_active}
    WHERE id = ${id}
    RETURNING id, name, description, is_active, created_at
  `;
  return (rows[0] as Category) ?? null;
}

export async function deleteCategory(id: number): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM categories WHERE id = ${id}`;
}

export async function countActiveCategories(): Promise<number> {
  const sql = getSql();
  const rows = await sql`
    SELECT COUNT(*)::int AS count FROM categories WHERE is_active = true
  `;
  return (rows[0] as { count: number }).count;
}
