import type {
	Adapter,
	AdapterUser,
} from 'next-auth/adapters';
import type { Pool } from '@neondatabase/serverless';

function toAdapterUser(row: {
	id: string;
	name: string | null;
	email: string;
	emailVerified: Date | null;
	image: string | null;
}): AdapterUser {
	return {
		id: row.id,
		email: row.email,
		name: row.name,
		emailVerified: row.emailVerified,
		image: row.image,
	};
}

export function createAppAdapter(pool: Pool): Adapter {
	return {
		async createVerificationToken(verificationToken) {
			const { identifier, expires, token } =
				verificationToken;
			await pool.query(
				`INSERT INTO verification_token (identifier, expires, token)
         VALUES ($1, $2, $3)`,
				[identifier, expires, token],
			);
			return verificationToken;
		},

		async useVerificationToken({ identifier, token }) {
			const result = await pool.query(
				`DELETE FROM verification_token
         WHERE identifier = $1 AND token = $2
         RETURNING identifier, expires, token`,
				[identifier, token],
			);
			return result.rows[0] ?? null;
		},

		async createUser(user) {
			const id = crypto.randomUUID();
			const result = await pool.query(
				`INSERT INTO users (id, name, email, "emailVerified", image)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, "emailVerified", image`,
				[
					id,
					user.name ?? null,
					user.email,
					user.emailVerified ?? null,
					user.image ?? null,
				],
			);
			return toAdapterUser(result.rows[0]);
		},

		async getUser(id) {
			const result = await pool.query(
				`SELECT id, name, email, "emailVerified", image FROM users WHERE id = $1`,
				[id],
			);
			if (result.rowCount === 0) return null;
			return toAdapterUser(result.rows[0]);
		},

		async getUserByEmail(email) {
			const result = await pool.query(
				`SELECT id, name, email, "emailVerified", image FROM users WHERE LOWER(email) = LOWER($1)`,
				[email],
			);
			if (result.rowCount === 0) return null;
			return toAdapterUser(result.rows[0]);
		},

		async updateUser(user) {
			const result = await pool.query(
				`UPDATE users SET
           name = COALESCE($2, name),
           email = COALESCE($3, email),
           "emailVerified" = COALESCE($4, "emailVerified"),
           image = COALESCE($5, image)
         WHERE id = $1
         RETURNING id, name, email, "emailVerified", image`,
				[
					user.id,
					user.name ?? null,
					user.email ?? null,
					user.emailVerified ?? null,
					user.image ?? null,
				],
			);
			if (result.rowCount === 0) {
				throw new Error('User not found');
			}
			return toAdapterUser(result.rows[0]);
		},
	};
}
