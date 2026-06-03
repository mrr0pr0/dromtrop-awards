import { LoginForm } from '@/components/auth/login-form';
import { Card } from '@/components/ui/card';

interface LoginPageProps {
	searchParams: Promise<{
		error?: string;
		verify?: string;
		callbackUrl?: string;
	}>;
}

export default async function LoginPage({
	searchParams,
}: LoginPageProps) {
	const params = await searchParams;

	const errorMessages: Record<string, string> = {
		pending: 'you need to wait to be acsepted',
		rejected:
			'Kontoen din er avvist. Kontakt arrangør hvis du mener dette er feil.',
		rejected_access: 'Du har ikke tilgang til denne siden.',
		CredentialsSignin: 'Feil e-post eller passord.',
	};

	const errorMessage = params.error
		? (errorMessages[params.error] ??
			'Noe gikk galt. Prøv igjen.')
		: null;

	return (
		<div className="flex min-h-screen flex-col items-center justify-center bg-black px-4">
			<div className="mb-8 text-center">
				<h1 className="font-[family-name:var(--font-display)] text-5xl font-light text-gold md:text-6xl">
					Drømtorp Awards
				</h1>
				<p className="mt-2 text-sm text-gold-light">
					Offisiell publikumsstemme for Drømtorp Awards
				</p>
			</div>

			<Card className="w-full max-w-md">
				<h2 className="mb-4 text-xl font-semibold text-white">
					Logg inn
				</h2>
				{errorMessage && (
					<p className="mb-4 rounded-lg border border-gold-deep/50 bg-gold-deep/20 px-3 py-2 text-sm text-gold-light">
						{errorMessage}
					</p>
				)}
				<LoginForm
					callbackUrl={params.callbackUrl ?? '/vote'}
				/>
			</Card>
		</div>
	);
}
