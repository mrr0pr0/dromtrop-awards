import { auth } from '@/auth';
import { NavbarClient } from './navbar-client';

interface NavbarProps {
	activePath?: 'home' | 'vote' | 'nominate' | 'results' | 'admin';
}

export async function Navbar({ activePath }: NavbarProps) {
	const session = await auth();

	return (
		<NavbarClient
			session={session}
			activePath={activePath}
		/>
	);
}
