import { getSql } from "./client";
import type { Nominee } from "@/types";

export async function listNomineesByCategory(
  categoryId: number,
): Promise<Nominee[]> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, category_id, user_id, image_url, description, site_url, video_url, what_we_made, created_at
    FROM nominees WHERE category_id = ${categoryId} ORDER BY name ASC
  `;
  return rows as Nominee[];
}

export async function listAllNominees(): Promise<
  (Nominee & { category_name: string })[]
> {
  const sql = getSql();
  const rows = await sql`
    SELECT n.id, n.name, n.category_id, n.user_id, n.image_url, n.description, n.site_url, n.video_url, n.what_we_made, n.created_at, c.name AS category_name
    FROM nominees n
    JOIN categories c ON c.id = n.category_id
    ORDER BY c.id ASC, n.name ASC
  `;
  return rows as (Nominee & { category_name: string })[];
}

export async function getNomineeById(id: number): Promise<Nominee | null> {
  const sql = getSql();
  const rows = await sql`
    SELECT id, name, category_id, user_id, image_url, description, site_url, video_url, what_we_made, created_at
    FROM nominees WHERE id = ${id} LIMIT 1
  `;
  return (rows[0] as Nominee) ?? null;
}

export async function createNominee(data: {
  name: string;
  category_id: number;
  user_id?: string | null;
  image_url?: string | null;
  description?: string | null;
  site_url?: string | null;
  video_url?: string | null;
  what_we_made?: string | null;
}): Promise<Nominee> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO nominees (name, category_id, user_id, image_url, description, site_url, video_url, what_we_made)
    VALUES (${data.name}, ${data.category_id}, ${data.user_id ?? null}, ${data.image_url ?? null}, ${data.description ?? null}, ${data.site_url ?? null}, ${data.video_url ?? null}, ${data.what_we_made ?? null})
    RETURNING id, name, category_id, user_id, image_url, description, site_url, video_url, what_we_made, created_at
  `;
  return rows[0] as Nominee;
}

export async function updateNominee(
  id: number,
  data: {
    name?: string;
    category_id?: number;
    user_id?: string | null;
    image_url?: string | null;
    description?: string | null;
    site_url?: string | null;
    video_url?: string | null;
    what_we_made?: string | null;
  },
): Promise<Nominee | null> {
  const sql = getSql();
  const existing = await getNomineeById(id);
  if (!existing) return null;

  const rows = await sql`
    UPDATE nominees SET
      name = ${data.name ?? existing.name},
      category_id = ${data.category_id ?? existing.category_id},
      user_id = ${data.user_id !== undefined ? data.user_id : existing.user_id},
      image_url = ${data.image_url !== undefined ? data.image_url : existing.image_url},
      description = ${data.description !== undefined ? data.description : existing.description},
      site_url = ${data.site_url !== undefined ? data.site_url : existing.site_url},
      video_url = ${data.video_url !== undefined ? data.video_url : existing.video_url},
      what_we_made = ${data.what_we_made !== undefined ? data.what_we_made : existing.what_we_made}
    WHERE id = ${id}
    RETURNING id, name, category_id, user_id, image_url, description, site_url, video_url, what_we_made, created_at
  `;
  return (rows[0] as Nominee) ?? null;
}

export async function deleteNominee(id: number): Promise<void> {
  const sql = getSql();
  await sql`DELETE FROM nominees WHERE id = ${id}`;
}
