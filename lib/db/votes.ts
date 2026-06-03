import { getSql } from "./client";
import type { Category, Nominee, Vote } from "@/types";
import { assignRanks } from "@/lib/utils/ranking";

export async function castVote(params: {
  userId: string;
  categoryId: number;
  nomineeId: number;
}): Promise<Vote> {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO votes (user_id, category_id, nominee_id)
    VALUES (${params.userId}, ${params.categoryId}, ${params.nomineeId})
    RETURNING id, user_id, category_id, nominee_id, created_at
  `;
  return rows[0] as Vote;
}

export async function getUserVotes(userId: string): Promise<Vote[]> {
  const sql = getSql();
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
  const sql = getSql();
  const rows = await sql`
    SELECT id, user_id, category_id, nominee_id, created_at
    FROM votes WHERE user_id = ${userId} AND category_id = ${categoryId} LIMIT 1
  `;
  return (rows[0] as Vote) ?? null;
}

export async function countTotalVotes(): Promise<number> {
  const sql = getSql();
  const rows = await sql`SELECT COUNT(*)::int AS count FROM votes`;
  return (rows[0] as { count: number }).count;
}

export async function getRecentVotes(limit = 10) {
  const sql = getSql();
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
  const sql = getSql();
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
  const sql = getSql();
  const categories = await sql`
    SELECT id, name, description, is_active, created_at
    FROM categories WHERE is_active = true ORDER BY id ASC
  `;

  const result = [];
  for (const category of categories as Category[]) {
    const nominees = await getLeaderboardByCategory(category.id);
    result.push({ category, nominees });
  }
  return result;
}
