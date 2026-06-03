'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
	isProducerOrAdmin,
	canVote,
} from '@/lib/auth/permissions';
import { cn } from '@/lib/utils/cn';
import type { Session } from 'next-auth';

interface NavbarClientProps {
	session: Session | null;
	activePath?: 'home' | 'vote' | 'results' | 'admin';
}

export function NavbarClient({
	session,
	activePath: activePathProp,
}: NavbarClientProps) {
	const pathname = usePathname();
	const user = session?.user;
	const isStaff = isProducerOrAdmin(session);

	// Determine active path based on prop or pathname
	const getActivePath = () => {
		if (activePathProp) return activePathProp;
		if (pathname === '/') return 'home';
		if (pathname.startsWith('/vote')) return 'vote';
		if (pathname.startsWith('/results')) return 'results';
		if (pathname.startsWith('/admin')) return 'admin';
		return 'home';
	};

	const activePath = getActivePath();

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
					<button
						onClick={() => signOut({ callbackUrl: '/' })}
						className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
					>
						Logg ut
					</button>
				) : (
					<Link
						href="/login"
						className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
					>
						Logg inn
					</Link>
				)}
			</nav>
		</header>
	);
}
