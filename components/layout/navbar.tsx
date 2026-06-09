import { auth } from '@/auth';
import { NavbarClient } from './navbar-client';

interface NavbarProps {
	activePath?:
		| 'home'
		| 'vote'
		| 'nominate'
		| 'results'
		| 'admin';
}

export async function Navbar({ activePath }: NavbarProps) {
	const session = await auth();
	const resultsVisible = process.env.RESULTS_VISIBLE === 'true';

	return (
		<NavbarClient
			session={session}
			activePath={activePath}
			resultsVisible={resultsVisible}
		/>
	);
}