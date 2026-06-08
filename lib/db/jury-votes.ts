import { sql } from './client';
import type { Nominee } from '@/types';

export interface JuryVote {
	id: number;
	user_id: string;
	category_id: number;
	nominee_id: number;
	created_at: Date;
}

export interface CategoryTop3 {
	category_id: number;
	category_name: string;
	nominees: (Nominee & { vote_count: number })[];
}

/** Returns the top 3 most-voted (audience votes) approved nominees for a category */
export async function getTop3ForCategory(
	categoryId: number,
): Promise<(Nominee & { vote_count: number })[]> {
	const rows = await sql`
    SELECT n.id, n.name, n.category_id, n.user_id, n.status,
           n.image_url, n.description, n.site_url, n.video_url, n.what_we_made, n.created_at,
           COUNT(v.id)::int AS vote_count
    FROM nominees n
    LEFT JOIN votes v ON v.nominee_id = n.id
    WHERE n.category_id = ${categoryId} AND n.status = 'approved'
    GROUP BY n.id
    ORDER BY vote_count DESC, n.name ASC
    LIMIT 3
  `;
	return rows as (Nominee & { vote_count: number })[];
}

/** Returns top-3 nominees for ALL active categories in one query */
export async function getAllTop3(): Promise<CategoryTop3[]> {
	const rows = await sql`
    WITH ranked AS (
      SELECT
        c.id AS category_id,
        c.name AS category_name,
        n.id,
        n.name,
        n.category_id AS nom_category_id,
        n.user_id,
        n.status,
        n.image_url,
        n.description,
        n.site_url,
        n.video_url,
        n.what_we_made,
        n.created_at,
        COUNT(v.id)::int AS vote_count,
        ROW_NUMBER() OVER (
          PARTITION BY c.id
          ORDER BY COUNT(v.id) DESC, n.name ASC
        ) AS rn
      FROM categories c
      LEFT JOIN nominees n ON n.category_id = c.id AND n.status = 'approved'
      LEFT JOIN votes v ON v.nominee_id = n.id
      WHERE c.is_active = true
      GROUP BY c.id, c.name, n.id, n.name, n.category_id, n.user_id, n.status,
               n.image_url, n.description, n.site_url, n.video_url, n.what_we_made, n.created_at
    )
    SELECT category_id, category_name, id, name, nom_category_id, user_id, status,
           image_url, description, site_url, video_url, what_we_made, created_at, vote_count, rn
    FROM ranked
    WHERE rn <= 3 OR id IS NULL
    ORDER BY category_id ASC, vote_count DESC, name ASC
  `;

	const map = new Map<number, CategoryTop3>();
	for (const row of rows as Record<string, unknown>[]) {
		const cid = row.category_id as number;
		if (!map.has(cid)) {
			map.set(cid, {
				category_id: cid,
				category_name: row.category_name as string,
				nominees: [],
			});
		}
		if (row.id != null) {
			map.get(cid)!.nominees.push({
				id: row.id as number,
				name: row.name as string,
				category_id: cid,
				user_id: row.user_id as string | null,
				status: 'approved',
				image_url: row.image_url as string | null,
				description: row.description as string | null,
				site_url: row.site_url as string | null,
				video_url: row.video_url as string | null,
				what_we_made: row.what_we_made as string | null,
				created_at: row.created_at as Date,
				vote_count: row.vote_count as number,
			});
		}
	}
	return Array.from(map.values());
}

export async function castJuryVote(params: {
	userId: string;
	categoryId: number;
	nomineeId: number;
}): Promise<JuryVote> {
	const rows = await sql`
    INSERT INTO jury_votes (user_id, category_id, nominee_id)
    VALUES (${params.userId}, ${params.categoryId}, ${params.nomineeId})
    ON CONFLICT (user_id, category_id)
    DO UPDATE SET nominee_id = EXCLUDED.nominee_id, created_at = NOW()
    RETURNING id, user_id, category_id, nominee_id, created_at
  `;
	return rows[0] as JuryVote;
}

/** Returns only the requesting jury member's own votes */
export async function getMyJuryVotes(
	userId: string,
): Promise<JuryVote[]> {
	const rows = await sql`
    SELECT id, user_id, category_id, nominee_id, created_at
    FROM jury_votes WHERE user_id = ${userId}
  `;
	return rows as JuryVote[];
}

/** Returns all jury votes — for admin view only. */
export async function getAllJuryVotes(): Promise<
	(JuryVote & {
		user_email: string;
		nominee_name: string;
		category_name: string;
	})[]
> {
	const rows = await sql`
    SELECT jv.id, jv.user_id, jv.category_id, jv.nominee_id, jv.created_at,
           u.email AS user_email, n.name AS nominee_name, c.name AS category_name
    FROM jury_votes jv
    JOIN users u ON u.id = jv.user_id
    JOIN nominees n ON n.id = jv.nominee_id
    JOIN categories c ON c.id = jv.category_id
    ORDER BY jv.created_at DESC
  `;
	return rows as (JuryVote & {
		user_email: string;
		nominee_name: string;
		category_name: string;
	})[];
}

export async function countTotalJuryVotes(): Promise<number> {
	const rows =
		await sql`SELECT COUNT(*)::int AS count FROM jury_votes`;
	return (rows[0] as { count: number }).count;
}
