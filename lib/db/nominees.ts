import { getSql } from "./client";
import type { Nominee } from "@/types";

export async function listNomineesByCategory(
  categoryId: number,
): Promise<Nominee[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, category_id, image_url, created_at
    FROM nominees WHERE category_id = ${categoryId} ORDER BY name ASC
  `;
  return rows as Nominee[];
}

export async function listAllNominees(): Promise<
  (Nominee & { category_name: string })[]
> {
  const sql = getSql();
  const rows = await sql`
    SELECT n.id, n.name, n.category_id, n.image_url, n.created_at, c.name AS category_name
    FROM nominees n
    JOIN categories c ON c.id = n.category_id
    ORDER BY c.id ASC, n.name ASC
  `;
  return rows as (Nominee & { category_name: string })[];
}

export async function getNomineeById(id: number): Promise<Nominee | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, category_id, image_url, created_at
    FROM nominees WHERE id = ${id} LIMIT 1
  `;
  return (rows[0] as Nominee) ?? null;
}

export async function createNominee(data: {
  name: string;
  category_id: number;
  image_url?: string | null;
}): Promise<Nominee> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO nominees (name, category_id, image_url)
    VALUES (${data.name}, ${data.category_id}, ${data.image_url ?? null})
    RETURNING id, name, category_id, image_url, created_at
  `;
  return rows[0] as Nominee;
}

export async function updateNominee(
  id: number,
  data: {
    name?: string;
    category_id?: number;
    image_url?: string | null;
  },
): Promise<Nominee | null> {
  const sql = getSql();
  const existing = await getNomineeById(id);
  if (!existing) return null;

  const rows = await sql`
    UPDATE nominees SET
      name = ${data.name ?? existing.name},
      category_id = ${data.category_id ?? existing.category_id},
      image_url = ${data.image_url !== undefined ? data.image_url : existing.image_url}
    WHERE id = ${id}
    RETURNING id, name, category_id, image_url, created_at
  `;
  return (rows[0] as Nominee) ?? null;
}

export async function deleteNominee(id: number): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM nominees WHERE id = ${id}`;
}
