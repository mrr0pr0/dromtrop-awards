import type { NextAuthConfig } from 'next-auth';
import { CredentialsSignin } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import {
	findUserByEmail,
	setUserPasswordHash,
	createPendingUser,
} from '@/lib/db/users';
import { authConfig } from './auth.config';
import { hashPassword, verifyPassword } from './password';

class WaitingForAcceptanceError extends CredentialsSignin {
	code = 'waiting_acceptance';
}

class RejectedAccountError extends CredentialsSignin {
	code = 'rejected';
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
				name: { label: 'Navn', type: 'text' },
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
				const name =
					typeof credentials.name === 'string' &&
					credentials.name.trim() !== '' &&
					credentials.name.trim() !== 'undefined'
						? credentials.name.trim()
						: null;

				if (!email || password.length < 6) {
					throw new InvalidPasswordError();
				}

				let dbUser = await findUserByEmail(email);

				// Unknown user — register them only once we have a name
				if (!dbUser) {
					if (name) {
						const newUser = await createPendingUser({ email, name, password });
						if (newUser.status === 'approved') {
							return {
								id: newUser.id,
								name: newUser.name,
								email: newUser.email,
								role: newUser.role,
								status: newUser.status,
							};
						}
					}
					throw new WaitingForAcceptanceError();
				}

				if (dbUser.status === 'pending') {
					throw new WaitingForAcceptanceError();
				}
				if (dbUser.status === 'rejected') {
					throw new RejectedAccountError();
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
