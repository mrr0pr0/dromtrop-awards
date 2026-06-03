import type { NextAuthConfig } from 'next-auth';
import { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {
	findUserByEmail,
	setUserPasswordHash,
} from '@/lib/db/users';
import { authConfig } from './auth.config';
import { hashPassword, verifyPassword } from './password';

class WaitingForAcceptanceError extends CredentialsSignin {
	code = 'waiting_acceptance';
}

class InvalidPasswordError extends CredentialsSignin {
	code = 'invalid_password';
}

export const fullAuthConfig: NextAuthConfig = {
	...authConfig,
	providers: [
		Credentials({
			credentials: {
				email: { label: 'E-post', type: 'email' },
				password: { label: 'Passord', type: 'password' },
			},
			async authorize(credentials) {
				const email =
					typeof credentials.email === 'string'
						? credentials.email.trim().toLowerCase()
						: '';
				const password =
					typeof credentials.password === 'string'
						? credentials.password
						: '';

				if (!email || password.length < 6) {
					throw new InvalidPasswordError();
				}

				const dbUser = await findUserByEmail(email);
				if (!dbUser || dbUser.status !== 'approved') {
					throw new WaitingForAcceptanceError();
				}

				if (dbUser.password_hash) {
					const isValidPassword = await verifyPassword(
						password,
						dbUser.password_hash,
					);
					if (!isValidPassword)
						throw new InvalidPasswordError();
				} else {
					const passwordHash = await hashPassword(password);
					await setUserPasswordHash(
						dbUser.id,
						passwordHash,
					);
				}

				return {
					id: dbUser.id,
					name: dbUser.name,
					email: dbUser.email,
					role: dbUser.role,
					status: dbUser.status,
				};
			},
		}),
	],
	callbacks: {
		...authConfig.callbacks,
		async jwt({ token, user, trigger }) {
			const email = token.email ?? user?.email;
			if (!email) return token;

			// On sign-in or explicit session refresh: re-read from DB so role/status
			// changes are picked up immediately. Skip for normal requests where the
			// token is already fully populated — avoids a DB hit on every API call.
			if (user || trigger === 'update' || !token.id) {
				const dbUser = await findUserByEmail(email);
				if (dbUser) {
					token.id = dbUser.id;
					token.role = dbUser.role;
					token.status = dbUser.status;
				}
			}

			return token;
		},
	},
};
