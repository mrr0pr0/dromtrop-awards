'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
	callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);
		setError(null);

		try {
			const result = await signIn('credentials', {
				email,
				password,
				redirect: false,
				callbackUrl,
			});

			if (result?.error) {
				const errorMap: Record<string, string> = {
					waiting_acceptance:
						'Kontoen din venter på godkjenning. Prøv igjen senere.',
					rejected:
						'Kontoen din er avvist. Kontakt arrangør hvis du mener dette er feil.',
				};
				setError(
					errorMap[result.code ?? ''] ??
					'Feil e-post eller passord.',
				);
			} else {
				window.location.href = result?.url ?? callbackUrl;
			}
		} catch {
			setError('Noe gikk galt. Prøv igjen.');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="flex flex-col gap-4"
		>
			<Input
				label="E-postadresse"
				type="email"
				name="email"
				placeholder="din@epost.no"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
				autoComplete="email"
			/>
			<Input
				label="Passord"
				type="password"
				name="password"
				placeholder="Skriv passord"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
				minLength={6}
				autoComplete="current-password"
			/>
			{error && (
				<p className="text-xs text-red-400">{error}</p>
			)}
			<Button
				type="submit"
				isLoading={isLoading}
				className="w-full"
			>
				Logg inn
			</Button>
			<p className="text-center text-xs font-light italic text-gold-light">
				Kun godkjente brukere kan logge inn. Første
				innlogging lagrer passordet ditt.
			</p>
		</form>
	);
}
