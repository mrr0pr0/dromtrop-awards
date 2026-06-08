import Image from 'next/image';
import { auth } from '@/auth';
import { signOut } from '@/auth';

export async function JuryNavbar() {
	const session = await auth();
	const user = session?.user;

	return (
		<header className="sticky top-0 z-20 border-b border-gold/40 bg-black/95 px-4 py-3 text-white sm:px-8 lg:px-14">
			<div className="mx-auto flex min-h-[72px] max-w-[1180px] flex-wrap items-center gap-3 sm:gap-5">
				<div className="inline-flex min-w-0 flex-1 items-center gap-3">
					<Image
						src="/favicon.ico"
						alt="DA Logo"
						width={34}
						height={34}
						className="shrink-0"
					/>
					<div className="min-w-0">
						<p className="truncate font-[family-name:var(--font-display)] text-xl font-bold text-white sm:text-2xl">
							Drømtorp Awards
						</p>
						<p className="text-xs font-semibold uppercase tracking-[0.12em] text-gold">
							Jury · Stem på det beste
						</p>
					</div>
				</div>

				<div className="flex w-full items-center justify-end gap-2 sm:w-auto">
					{user?.email && (
						<span className="hidden min-h-10 items-center text-sm text-white/70 sm:inline-flex">
							{user.email}
						</span>
					)}
					{user?.email ? (
						<form
							action={async () => {
								'use server';
								await signOut({ redirectTo: '/login' });
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
					) : null}
				</div>
			</div>
		</header>
	);
}
