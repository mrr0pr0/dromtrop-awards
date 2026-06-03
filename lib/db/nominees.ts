import { sql } from './client';
import type { Nominee } from '@/types';

export async function listNomineesByCategory(
	categoryId: number,
): Promise<Nominee[]> {
	const rows = await sql`
    SELECT id, name, category_id, user_id, image_url, description, site_url, video_url, what_we_made, created_at
    FROM nominees WHERE category_id = ${categoryId} ORDER BY name ASC
  `;
	return rows as Nominee[];
}

export async function listAllNominees(): Promise<
	(Nominee & { category_name: string })[]
> {
	const rows = await sql`
    SELECT n.id, n.name, n.category_id, n.user_id, n.image_url, n.description, n.site_url, n.video_url, n.what_we_made, n.created_at, c.name AS category_name
    FROM nominees n
    JOIN categories c ON c.id = n.category_id
    ORDER BY c.id ASC, n.name ASC
  `;
	return rows as (Nominee & { category_name: string })[];
}

export async function getNomineeById(
	id: number,
): Promise<Nominee | null> {
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
	// COALESCE lets Postgres keep the existing value when we pass NULL for an
	// unset optional — no extra SELECT round-trip needed.
	const rows = await sql`
    UPDATE nominees SET
      name        = COALESCE(${data.name ?? null},        name),
      category_id = COALESCE(${data.category_id ?? null}, category_id),
      user_id     = CASE WHEN ${data.user_id !== undefined}::boolean
                         THEN ${data.user_id ?? null}
                         ELSE user_id END,
      image_url   = CASE WHEN ${data.image_url !== undefined}::boolean
                         THEN ${data.image_url ?? null}
                         ELSE image_url END,
      description = CASE WHEN ${data.description !== undefined}::boolean
                         THEN ${data.description ?? null}
                         ELSE description END,
      site_url    = CASE WHEN ${data.site_url !== undefined}::boolean
                         THEN ${data.site_url ?? null}
                         ELSE site_url END,
      video_url   = CASE WHEN ${data.video_url !== undefined}::boolean
                         THEN ${data.video_url ?? null}
                         ELSE video_url END,
      what_we_made = CASE WHEN ${data.what_we_made !== undefined}::boolean
                          THEN ${data.what_we_made ?? null}
                          ELSE what_we_made END
    WHERE id = ${id}
    RETURNING id, name, category_id, user_id, image_url, description, site_url, video_url, what_we_made, created_at
  `;
	return (rows[0] as Nominee) ?? null;
}

export async function deleteNominee(
	id: number,
): Promise<void> {
	await sql`DELETE FROM nominees WHERE id = ${id}`;
}

export async function countNomineesByCategory(): Promise<
	Record<number, number>
> {
	const rows = await sql`
    SELECT category_id, COUNT(*)::int AS count
    FROM nominees
    GROUP BY category_id
  `;
	const counts: Record<number, number> = {};
	for (const row of rows as {
		category_id: number;
		count: number;
	}[]) {
		counts[row.category_id] = row.count;
	}
	return counts;
}
