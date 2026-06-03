import { sql } from "./client";
import type { Category, Nominee, Vote } from "@/types";
import { assignRanks } from "@/lib/utils/ranking";

export async function castVote(params: {
  userId: string;
  categoryId: number;
  nomineeId: number;
}): Promise<Vote> {
  const rows = await sql`
    INSERT INTO votes (user_id, category_id, nominee_id)
    VALUES (${params.userId}, ${params.categoryId}, ${params.nomineeId})
    RETURNING id, user_id, category_id, nominee_id, created_at
  `;
  return rows[0] as Vote;
}

export async function getUserVotes(userId: string): Promise<Vote[]> {
  const rows = await sql`
    SELECT id, user_id, category_id, nominee_id, created_at
    FROM votes WHERE user_id = ${userId}
  `;
  return rows as Vote[];
}

export async function getUserVoteForCategory(
  userId: string,
  categoryId: number,
): Promise<Vote | null> {
  const rows = await sql`
    SELECT id, user_id, category_id, nominee_id, created_at
    FROM votes WHERE user_id = ${userId} AND category_id = ${categoryId} LIMIT 1
  `;
  return (rows[0] as Vote) ?? null;
}

export async function countTotalVotes(): Promise<number> {
  const rows = await sql`SELECT COUNT(*)::int AS count FROM votes`;
  return (rows[0] as { count: number }).count;
}

export async function getRecentVotes(limit = 10) {
  const rows = await sql`
    SELECT v.id, v.created_at, u.email AS user_email, c.name AS category_name, n.name AS nominee_name
    FROM votes v
    JOIN users u ON u.id = v.user_id
    JOIN categories c ON c.id = v.category_id
    JOIN nominees n ON n.id = v.nominee_id
    ORDER BY v.created_at DESC
    LIMIT ${limit}
  `;
  return rows as {
    id: number;
    created_at: Date;
    user_email: string;
    category_name: string;
    nominee_name: string;
  }[];
}

export async function getLeaderboardByCategory(categoryId: number) {
  const rows = await sql`
    SELECT n.id, n.name, n.category_id, n.image_url, n.created_at,
           COUNT(v.id)::int AS vote_count
    FROM nominees n
    LEFT JOIN votes v ON v.nominee_id = n.id
    WHERE n.category_id = ${categoryId}
    GROUP BY n.id
    ORDER BY vote_count DESC, n.name ASC
  `;

  const withCounts = rows as (Nominee & { vote_count: number })[];
  return assignRanks(withCounts);
}

export async function getFullLeaderboard() {
  // Single query instead of N+1 loop — fetches all categories + nominees + vote counts at once
  const rows = await sql`
    SELECT
      c.id          AS cat_id,
      c.name        AS cat_name,
      c.description AS cat_description,
      c.is_active   AS cat_is_active,
      c.created_at  AS cat_created_at,
      n.id          AS nom_id,
      n.name        AS nom_name,
      n.image_url   AS nom_image_url,
      n.created_at  AS nom_created_at,
      COUNT(v.id)::int AS vote_count
    FROM categories c
    LEFT JOIN nominees n ON n.category_id = c.id
    LEFT JOIN votes v ON v.nominee_id = n.id
    WHERE c.is_active = true
    GROUP BY c.id, c.name, c.description, c.is_active, c.created_at,
             n.id, n.name, n.image_url, n.created_at
    ORDER BY c.id ASC, vote_count DESC, n.name ASC
  `;

  // Group flat rows into { category, nominees[] } structure
  const categoryMap = new Map<
    number,
    { category: Category; nominees: (Nominee & { vote_count: number })[] }
  >();

  for (const row of rows as Record<string, unknown>[]) {
    const catId = row.cat_id as number;

    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        category: {
          id: catId,
          name: row.cat_name as string,
          description: row.cat_description as string | null,
          is_active: row.cat_is_active as boolean,
          created_at: row.cat_created_at as Date,
        },
        nominees: [],
      });
    }

    // A category with no nominees produces a single row with null nom_id
    if (row.nom_id != null) {
      categoryMap.get(catId)!.nominees.push({
        id: row.nom_id as number,
        name: row.nom_name as string,
        category_id: catId,
        image_url: row.nom_image_url as string | null,
        created_at: row.nom_created_at as Date,
        vote_count: row.vote_count as number,
      } as Nominee & { vote_count: number });
    }
  }

  return Array.from(categoryMap.values()).map(({ category, nominees }) => ({
    category,
    nominees: assignRanks(nominees),
  }));
}