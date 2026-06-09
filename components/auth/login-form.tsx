'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
	callbackUrl: string;
}

export function LoginForm({ callbackUrl }: LoginFormProps) {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [showName, setShowName] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(
		null,
	);

	// Strip any host from callbackUrl so we never redirect off-domain
	function safeRedirectPath(url: string): string {
		try {
			const parsed = new URL(url);
			return parsed.pathname + parsed.search;
		} catch {
			return url.startsWith('/') ? url : '/vote';
		}
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const result = await signIn('credentials', {
				email,
				password,
				name: showName ? name.trim() : '',
				redirect: false,
			});

			if (result?.error) {
				const code = result.code ?? '';

				if (code === 'waiting_acceptance') {
					// If they haven't filled in name yet, prompt for it
					if (!showName && !name.trim()) {
						setShowName(true);
						setSuccess(
							'E-posten din er ikke registrert. Fyll inn navnet ditt for å be om tilgang.',
						);
					} else {
						setSuccess(
							'Forespørselen din er sendt! En administrator godkjenner kontoen din snart.',
						);
					}
					return;
				}

				const errorMap: Record<string, string> = {
					rejected:
						'Kontoen din er avvist. Kontakt arrangør hvis du mener dette er feil.',
				};
				setError(
					errorMap[code] ?? 'Feil e-post eller passord.',
				);
			} else {
				router.push(safeRedirectPath(callbackUrl));
				router.refresh();
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
				onChange={(e) => {
					setEmail(e.target.value);
					setShowName(false);
					setSuccess(null);
				}}
				required
				autoComplete="email"
			/>
			{showName && (
				<Input
					label="Fullt navn"
					type="text"
					name="name"
					placeholder="Ola Nordmann"
					value={name}
					onChange={(e) => setName(e.target.value)}
					required
					autoComplete="name"
					autoFocus
				/>
			)}
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
				<p className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-400">
					{error}
				</p>
			)}
			{success && (
				<p className="rounded-lg border border-gold-deep/50 bg-gold-deep/20 px-3 py-2 text-xs text-gold-light">
					{success}
				</p>
			)}
			{!success?.includes('snart') && (
				<Button
					type="submit"
					isLoading={isLoading}
					className="w-full"
				>
					{showName ? 'Be om tilgang' : 'Logg inn'}
				</Button>
			)}
			<p className="text-center text-xs font-light italic text-gold-light">
				Kun godkjente brukere kan logge inn. Første
				innlogging lagrer passordet ditt.
			</p>
			<p className="text-center text-xs font-light italic text-gold-light strong">
				AFK Epost er godkjent
			</p>
		</form>
	);
}
