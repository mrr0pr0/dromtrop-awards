import { sql } from './client';
import type { Category } from '@/types';

export async function listCategories(
	activeOnly = false,
): Promise<Category[]> {
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

export async function getCategoryById(
	id: number,
): Promise<Category | null> {
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
	const rows = await sql`
    UPDATE categories SET
      name        = COALESCE(${data.name ?? null}, name),
      description = CASE WHEN ${data.description !== undefined}::boolean
                         THEN ${data.description ?? null}
                         ELSE description END,
      is_active   = COALESCE(${data.is_active ?? null}, is_active)
    WHERE id = ${id}
    RETURNING id, name, description, is_active, created_at
  `;
	return (rows[0] as Category) ?? null;
}

export async function deleteCategory(
	id: number,
): Promise<void> {
	await sql`DELETE FROM categories WHERE id = ${id}`;
}

export async function countActiveCategories(): Promise<number> {
	const rows = await sql`
    SELECT COUNT(*)::int AS count FROM categories WHERE is_active = true
  `;
	return (rows[0] as { count: number }).count;
}
