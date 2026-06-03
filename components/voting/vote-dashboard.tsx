'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Category, Nominee, Vote } from '@/types';
import { categorySlug } from '@/lib/voting/category-layout';
import { VoteSidebar } from './vote-sidebar';
import { NomineeListRow } from './nominee-list-row';
import { cn } from '@/lib/utils/cn';

interface VoteDashboardProps {
	categories: Category[];
	nominees: Record<number, Nominee[]>;
	userVotes: Vote[];
	currentUserId: string | undefined;
}

type FilterMode = 'all' | 'open' | 'empty';

export function VoteDashboard({
	categories,
	nominees,
	userVotes,
	currentUserId,
}: VoteDashboardProps) {
	const [localVotes, setLocalVotes] =
		useState<Vote[]>(userVotes);
	const [votingKey, setVotingKey] = useState<string | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const [toast, setToast] = useState<string | null>(null);
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState<FilterMode>('all');
	const [activeSlug, setActiveSlug] = useState<
		string | null
	>(null);

	useEffect(() => {
		setLocalVotes(userVotes);
	}, [userVotes]);

	useEffect(() => {
		if (!toast) return;
		const t = window.setTimeout(() => setToast(null), 2600);
		return () => window.clearTimeout(t);
	}, [toast]);

	useEffect(() => {
		const hash = window.location.hash.replace(/^#/, '');
		if (hash) setActiveSlug(hash);

		function onHashChange() {
			const h = window.location.hash.replace(/^#/, '');
			if (h) setActiveSlug(h);
		}
		window.addEventListener('hashchange', onHashChange);
		return () =>
			window.removeEventListener(
				'hashchange',
				onHashChange,
			);
	}, []);

	const nomineeCounts = useMemo(() => {
		const counts: Record<number, number> = {};
		for (const c of categories) {
			counts[c.id] = nominees[c.id]?.length ?? 0;
		}
		return counts;
	}, [categories, nominees]);

	const totalNominees = useMemo(
		() =>
			Object.values(nominees).reduce(
				(sum, list) => sum + list.length,
				0,
			),
		[nominees],
	);

	async function handleVote(
		categoryId: number,
		nomineeId: number,
	) {
		if (!currentUserId) return;

		setVotingKey(`${categoryId}-${nomineeId}`);
		setError(null);

		try {
			const res = await fetch('/api/votes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ categoryId, nomineeId }),
			});

			const data = (await res.json()) as { error?: string };
			if (!res.ok) {
				setError(
					data.error || 'Kunne ikke registrere stemme.',
				);
				setVotingKey(null);
				return;
			}

			const filtered = localVotes.filter(
				(v) => v.category_id !== categoryId,
			);
			filtered.push({
				id: 0,
				user_id: currentUserId,
				category_id: categoryId,
				nominee_id: nomineeId,
				created_at: new Date(),
			});
			setLocalVotes(filtered);

			const nominee = nominees[categoryId]?.find(
				(n) => n.id === nomineeId,
			);
			setToast(
				nominee
					? `Stemmen på ${nominee.name} er registrert.`
					: 'Stemmen er registrert.',
			);
		} catch {
			setError('Nettverksfeil. Prøv igjen.');
		} finally {
			setVotingKey(null);
		}
	}

	function scrollToCategory(slug: string) {
		setActiveSlug(slug);
		window.location.hash = slug;
		const el = document.getElementById(slug);
		el?.scrollIntoView({
			behavior: 'smooth',
			block: 'start',
		});
	}

	const query = search.trim().toLowerCase();

	const visibleCategories = categories.filter(
		(category) => {
			const slug = categorySlug(category.name);
			const list = nominees[category.id] ?? [];
			const state = list.length > 0 ? 'open' : 'empty';
			const searchBlob =
				`${category.name} ${category.description ?? ''} ${list.map((n) => `${n.name} ${n.description ?? ''}`).join(' ')}`.toLowerCase();
			const matchesText =
				!query || searchBlob.includes(query);
			const matchesFilter =
				filter === 'all' || filter === state;
			return matchesText && matchesFilter;
		},
	);

	return (
		<div className="text-white">
			<section className="mb-7 grid items-end gap-5 md:grid-cols-[1.15fr_0.85fr] md:gap-12">
				<div>
					<p className="font-mono text-xs font-extrabold uppercase tracking-wider text-gold-light">
						Stemmegivning
					</p>
					<h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl leading-[0.96] text-gold sm:text-5xl md:text-6xl lg:text-7xl">
						Stem på din favorit
					</h1>
					<p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
						Din stemme teller! Velg prosjektet du mener
						fortjener å vinne Drømtorp Awards.
					</p>
				</div>
				<aside
					className="rounded-[14px] border border-gold/35 bg-black p-5 text-white shadow-lg"
					aria-label="Stemmesammendrag"
				>
					<p className="text-sm font-extrabold uppercase tracking-wide text-gold-light">
						Din stemmestatus
					</p>
					<div className="mt-4 grid grid-cols-3 gap-3">
						<div className="rounded-[10px] border border-white/15 px-2 py-3 text-center">
							<strong className="block text-2xl tabular-nums text-gold">
								{localVotes.length}
							</strong>
							<span className="mt-1 block text-xs text-white/70">
								stemmer
							</span>
						</div>
						<div className="rounded-[10px] border border-white/15 px-2 py-3 text-center">
							<strong className="block text-2xl tabular-nums text-gold">
								{categories.length}
							</strong>
							<span className="mt-1 block text-xs text-white/70">
								kategorier
							</span>
						</div>
						<div className="rounded-[10px] border border-white/15 px-2 py-3 text-center">
							<strong className="block text-2xl tabular-nums text-gold">
								{totalNominees}
							</strong>
							<span className="mt-1 block text-xs text-white/70">
								nominerte
							</span>
						</div>
					</div>
				</aside>
			</section>

			<section
				className="sticky top-3 z-10 mb-5 grid gap-3 rounded-[14px] border border-gold-light/20 bg-black/90 p-3.5 backdrop-blur md:grid-cols-[1fr_auto]"
				aria-label="Filtrer nominasjoner"
			>
				<label className="relative block">
					<span className="sr-only">
						Søk i kategorier og nominerte
					</span>
					<input
						type="search"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Søk etter kategori eller nominert"
						className="w-full min-h-[46px] rounded-[10px] border border-gold-light/30 bg-parchment/[0.08] pl-11 pr-4 text-white placeholder:text-white/40 outline-none transition-shadow focus:border-gold focus:ring-[3px] focus:ring-gold/20"
					/>
					<span
						className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-[54%] rounded-full border-2 border-gold-light"
						aria-hidden
					/>
				</label>
				<div className="flex gap-2 overflow-x-auto">
					{(
						[
							['all', 'Alle'],
							['open', 'Med nominerte'],
							['empty', 'Uten nominerte'],
						] as const
					).map(([mode, label]) => (
						<button
							key={mode}
							type="button"
							aria-pressed={filter === mode}
							onClick={() => setFilter(mode)}
							className={cn(
								'min-h-[42px] shrink-0 rounded-full border px-3.5 text-sm transition-colors',
								filter === mode
									? 'border-gold-light bg-gold/10 text-gold-light'
									: 'border-gold-light/25 bg-parchment/[0.04] text-white/70 hover:border-gold hover:bg-gold/10 hover:text-white',
							)}
						>
							{label}
						</button>
					))}
				</div>
			</section>

			{error && (
				<p className="mb-4 rounded-lg border border-gold/40 bg-gold/15 px-4 py-3 text-sm text-gold">
					{error}
				</p>
			)}

			<div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
				<VoteSidebar
					categories={categories}
					nomineeCounts={nomineeCounts}
					activeSlug={activeSlug}
					onNavigate={scrollToCategory}
				/>

				<div className="grid gap-4">
					{visibleCategories.length === 0 ? (
						<p className="rounded-[16px] border border-gold-light/20 bg-black/40 p-6 text-white/70">
							Ingen kategorier matcher søket.
						</p>
					) : (
						visibleCategories.map((category) => {
							const slug = categorySlug(category.name);
							const list = nominees[category.id] ?? [];
							const categoryVote = localVotes.find(
								(v) => v.category_id === category.id,
							);
							const hasVotedInCategory = !!categoryVote;

							return (
								<article
									key={category.id}
									id={slug}
									className="scroll-mt-28 overflow-hidden rounded-[16px] border border-gold-light/20 bg-black/40 backdrop-blur motion-safe:animate-[rise_520ms_ease_both]"
								>
									<header className="grid gap-3 border-b border-gold-light/20 bg-gradient-to-r from-gold/10 to-transparent px-5 py-5 sm:grid-cols-[1fr_auto] sm:px-6">
										<div>
											<h2 className="font-[family-name:var(--font-display)] text-2xl leading-tight text-gold sm:text-3xl">
												{category.name}
											</h2>
											<p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
												{list.length > 0
													? 'Her ligger bidragene som er klare for vurdering. Kortet viser det viktigste først, med detaljer ett klikk unna.'
													: 'Nominerte vises her når kategorien er klar.'}
											</p>
										</div>
										<span className="inline-flex h-8 items-center self-start rounded-full border border-gold-light/25 bg-parchment/[0.08] px-2.5 text-xs font-extrabold text-gold-light">
											{list.length}{' '}
											{list.length === 1
												? 'nominert'
												: 'nominerte'}
										</span>
									</header>

									{list.length === 0 ? (
										<div className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-3.5 px-5 py-5 sm:px-6">
											<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gold-light/25 bg-parchment/[0.08] font-[family-name:var(--font-display)] text-2xl font-bold text-gold-light">
												0
											</div>
											<div>
												<strong className="block text-white">
													Ingen nominerte ennå
												</strong>
												<span className="mt-1 block text-sm text-white/70">
													Denne kategorien er synlig, men
													har ingen bidrag å stemme på
													akkurat nå.
												</span>
											</div>
										</div>
									) : (
										<div>
											{list.map((nominee) => (
												<NomineeListRow
													key={nominee.id}
													nominee={nominee}
													category={category}
													hasVotedInCategory={
														hasVotedInCategory
													}
													isSelected={
														categoryVote?.nominee_id ===
														nominee.id
													}
													isVoting={
														votingKey ===
														`${category.id}-${nominee.id}`
													}
													isOwnNominee={
														!!currentUserId &&
														nominee.user_id ===
															currentUserId
													}
													onVote={() =>
														handleVote(
															category.id,
															nominee.id,
														)
													}
												/>
											))}
										</div>
									)}
								</article>
							);
						})
					)}
				</div>
			</div>

			<div
				role="status"
				aria-live="polite"
				className={cn(
					'pointer-events-none fixed bottom-[18px] right-[18px] z-30 w-[min(360px,calc(100%-36px))] rounded-xl border border-gold/45 bg-black px-4 py-4 text-sm text-white shadow-lg transition-all duration-200',
					toast
						? 'translate-y-0 opacity-100'
						: 'translate-y-3 opacity-0',
				)}
			>
				{toast}
			</div>
		</div>
	);
}
