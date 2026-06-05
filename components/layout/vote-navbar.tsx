import Image from 'next/image';
import Link from 'next/link';
import { auth } from '@/auth';
import { signOut } from '@/auth';
import {
	canVote,
	isProducerOrAdmin,
} from '@/lib/auth/permissions';
import { cn } from '@/lib/utils/cn';

interface VoteNavbarProps {
	activePath?:
		| 'vote'
		| 'home'
		| 'nominate'
		| 'results'
		| 'admin';
}

export async function VoteNavbar({
	activePath = 'vote',
}: VoteNavbarProps) {
	const session = await auth();
	const user = session?.user;
	const isStaff = isProducerOrAdmin(session);

	return (
		<header className="sticky top-0 z-20 flex min-h-[72px] flex-wrap items-center gap-3 border-b border-gold/40 bg-black/95 px-4 py-3 text-white sm:gap-5 sm:px-8 lg:px-14">
			<Link
				href="/"
				className="inline-flex min-w-0 flex-1 items-center gap-3 font-[family-name:var(--font-display)] text-xl font-bold text-white sm:text-2xl"
				aria-label="Drømtorp Awards hjem"
			>
				<Image
					src="/favicon.ico"
					alt="DA Logo"
					width={34}
					height={34}
					className="shrink-0"
				/>
				<span className="truncate">Drømtorp Awards</span>
			</Link>

			<nav
				className="flex w-full items-center gap-1.5 overflow-x-auto pb-0.5 sm:w-auto sm:pb-0"
				aria-label="Hovedmeny"
			>
				<Link
					href="/"
					className={cn(
						'inline-flex min-h-10 shrink-0 items-center rounded-lg px-3 text-sm transition-colors',
						activePath === 'home'
							? 'bg-gold font-bold text-black'
							: 'text-white/80 hover:bg-white/10 hover:text-white',
					)}
				>
					Hjem
				</Link>
				{canVote(session) && (
					<Link
						href="/vote"
						className={cn(
							'inline-flex min-h-10 shrink-0 items-center rounded-lg px-3 text-sm transition-colors',
							activePath === 'vote'
								? 'bg-gold font-bold text-black'
								: 'text-white/80 hover:bg-white/10 hover:text-white',
						)}
					>
						Stem
					</Link>
				)}
				{canVote(session) && (
					<Link
						href="/nominate"
						className={cn(
							'inline-flex min-h-10 shrink-0 items-center rounded-lg px-3 text-sm transition-colors',
							activePath === 'nominate'
								? 'bg-gold font-bold text-black'
								: 'text-white/80 hover:bg-white/10 hover:text-white',
						)}
					>
						Nominer
					</Link>
				)}
				<Link
					href="/results"
					className={cn(
						'inline-flex min-h-10 shrink-0 items-center rounded-lg px-3 text-sm transition-colors',
						activePath === 'results'
							? 'bg-gold font-bold text-black'
							: 'text-white/80 hover:bg-white/10 hover:text-white',
					)}
				>
					Resultater
				</Link>
				{isStaff && (
					<Link
						href="/admin/dashboard"
						className={cn(
							'inline-flex min-h-10 shrink-0 items-center rounded-lg px-3 text-sm transition-colors',
							activePath === 'admin'
								? 'bg-gold font-bold text-black'
								: 'text-white/80 hover:bg-white/10 hover:text-white',
						)}
					>
						Admin
					</Link>
				)}
				{user?.email && (
					<span className="hidden min-h-10 items-center border-l border-white/15 pl-3 text-sm text-white/70 lg:inline-flex">
						{user.email}
					</span>
				)}
				{user?.email ? (
					<form
						action={async () => {
							'use server';
							await signOut({ redirectTo: '/' });
						}}
						className="shrink-0"
					>
						<button
							type="submit"
							className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
						>
							Logg ut
						</button>
					</form>
				) : (
					<Link
						href="/login"
						className="inline-flex min-h-10 items-center rounded-lg bg-gold px-3 text-sm font-bold text-black"
					>
						Logg inn
					</Link>
				)}
			</nav>
		</header>
	);
}
