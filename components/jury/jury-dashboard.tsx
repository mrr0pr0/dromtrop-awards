'use client';

import { useEffect, useState } from 'react';
import type { Nominee } from '@/types';
import type {
	CategoryTop3,
	JuryVote,
} from '@/lib/db/jury-votes';
import { nomineeInitials } from '@/components/voting/nominee-display';
import { resolveMediaUrl } from '@/lib/uploads/b2-media';
import { cn } from '@/lib/utils/cn';

interface JuryDashboardProps {
	categories: CategoryTop3[];
	myVotes: JuryVote[];
	votingOpen: boolean;
}

export function JuryDashboard({
	categories,
	myVotes,
	votingOpen,
}: JuryDashboardProps) {
	const [localVotes, setLocalVotes] =
		useState<JuryVote[]>(myVotes);
	const [votingKey, setVotingKey] = useState<string | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);
	const [toast, setToast] = useState<string | null>(null);

	useEffect(() => {
		if (!toast) return;
		const t = window.setTimeout(() => setToast(null), 2600);
		return () => window.clearTimeout(t);
	}, [toast]);

	async function handleVote(
		categoryId: number,
		nomineeId: number,
	) {
		if (!votingOpen) return;

		setVotingKey(`${categoryId}-${nomineeId}`);
		setError(null);

		try {
			const res = await fetch('/api/jury/vote', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ categoryId, nomineeId }),
			});

			const data = (await res.json()) as {
				error?: string;
				vote?: JuryVote;
			};

			if (!res.ok) {
				setError(
					data.error || 'Kunne ikke registrere stemme.',
				);
				setVotingKey(null);
				return;
			}

			const previousVote = localVotes.find(
				(v) => v.category_id === categoryId,
			);
			const isChange =
				!!previousVote &&
				previousVote.nominee_id !== nomineeId;

			if (data.vote) {
				const filtered = localVotes.filter(
					(v) => v.category_id !== categoryId,
				);
				filtered.push(data.vote);
				setLocalVotes(filtered);
			}

			const category = categories.find(
				(c) => c.category_id === categoryId,
			);
			const nominee = category?.nominees.find(
				(n) => n.id === nomineeId,
			);
			setToast(
				nominee
					? isChange
						? `Jury-stemmen er endret til ${nominee.name}.`
						: `Jury-stemmen på ${nominee.name} er registrert.`
					: isChange
						? 'Jury-stemmen er endret.'
						: 'Jury-stemmen er registrert.',
			);
		} catch {
			setError('Nettverksfeil. Prøv igjen.');
		} finally {
			setVotingKey(null);
		}
	}

	const votedCount = localVotes.length;
	const totalCategories = categories.length;

	return (
		<div>
			<header className="mb-8">
				<p className="text-xs font-extrabold uppercase tracking-[0.14em] text-gold">
					Jury
				</p>
				<h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-light text-white sm:text-5xl">
					Stem på det beste
				</h1>
				<p className="mt-3 max-w-2xl text-base text-gold-light">
					Du stemmer som jury. Velg én vinner blant de tre
					mest populære nominerte i hver kategori.
				</p>
				<p className="mt-2 text-sm text-white/60">
					{votedCount} av {totalCategories} kategorier
					avgitt
				</p>
			</header>

			{!votingOpen && (
				<div
					className="mb-6 rounded-lg border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-gold-light"
					role="status"
				>
					Jury-avstemning er for øyeblikket stengt.
				</div>
			)}

			{error && (
				<div
					className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
					role="alert"
				>
					{error}
				</div>
			)}

			{toast && (
				<div
					className="fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-lg border border-gold/40 bg-charcoal px-5 py-3 text-sm text-gold-light shadow-lg"
					role="status"
				>
					{toast}
				</div>
			)}

			<div className="space-y-10">
				{categories.map((category) => (
					<JuryCategorySection
						key={category.category_id}
						category={category}
						userVote={localVotes.find(
							(v) =>
								v.category_id ===
								category.category_id,
						)}
						votingOpen={votingOpen}
						votingKey={votingKey}
						onVote={handleVote}
					/>
				))}
			</div>

			{categories.length === 0 && (
				<p className="text-sm text-white/60">
					Ingen aktive kategorier med finalister ennå.
				</p>
			)}
		</div>
	);
}

interface JuryCategorySectionProps {
	category: CategoryTop3;
	userVote: JuryVote | undefined;
	votingOpen: boolean;
	votingKey: string | null;
	onVote: (categoryId: number, nomineeId: number) => void;
}

function JuryCategorySection({
	category,
	userVote,
	votingOpen,
	votingKey,
	onVote,
}: JuryCategorySectionProps) {
	const hasVotedInCategory = !!userVote;

	return (
		<section className="overflow-hidden rounded-lg border border-gold/30 bg-charcoal">
			<h2 className="border-b border-gold/20 px-5 py-4 font-[family-name:var(--font-display)] text-2xl font-light text-gold-light sm:px-6 sm:text-3xl">
				{category.category_name}
			</h2>

			{category.nominees.length === 0 ? (
				<p className="px-5 py-6 text-sm text-white/60 sm:px-6">
					Ingen finalister i denne kategorien ennå.
				</p>
			) : (
				<div className="grid gap-0 sm:grid-cols-3">
					{category.nominees.map((nominee) => (
						<JuryNomineeCard
							key={nominee.id}
							nominee={nominee}
							hasVotedInCategory={hasVotedInCategory}
							isSelected={
								userVote?.nominee_id === nominee.id
							}
							isVoting={
								votingKey ===
								`${category.category_id}-${nominee.id}`
							}
							votingOpen={votingOpen}
							onVote={() =>
								onVote(
									category.category_id,
									nominee.id,
								)
							}
						/>
					))}
				</div>
			)}
		</section>
	);
}

interface JuryNomineeCardProps {
	nominee: Nominee & { vote_count: number };
	hasVotedInCategory: boolean;
	isSelected: boolean;
	isVoting: boolean;
	votingOpen: boolean;
	onVote: () => void;
}

function JuryNomineeCard({
	nominee,
	hasVotedInCategory,
	isSelected,
	isVoting,
	votingOpen,
	onVote,
}: JuryNomineeCardProps) {
	const mediaUrl = resolveMediaUrl(nominee.image_url);
	const showThumb = !!mediaUrl;

	return (
		<article
			className={cn(
				'flex flex-col border-b border-gold/10 p-5 transition-all duration-200 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0',
				isSelected && 'ring-2 ring-inset ring-gold',
			)}
		>
			<div
				className={cn(
					'mb-4 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-lg border border-gold-light/20',
					showThumb
						? 'bg-black'
						: 'bg-gradient-to-br from-gold/20 to-gold-light/30 font-[family-name:var(--font-display)] text-3xl font-bold text-gold-light',
				)}
			>
				{showThumb ? (
					<img
						src={mediaUrl}
						alt=""
						className="h-full w-full object-cover"
					/>
				) : (
					nomineeInitials(nominee.name)
				)}
			</div>

			<h3 className="text-lg font-medium text-white">
				{nominee.name}
			</h3>

			<p className="mt-1 text-xs text-white/50">
				{nominee.vote_count}{' '}
				{nominee.vote_count === 1
					? 'publikumsstemme'
					: 'publikumsstemmer'}
			</p>

			<div className="mt-4 flex-1" />

			{hasVotedInCategory && isSelected ? (
				<span className="inline-flex min-h-11 items-center justify-center rounded-lg border border-gold bg-gold/10 text-sm font-semibold text-gold">
					Stemt ✓
				</span>
			) : (
				<button
					type="button"
					onClick={onVote}
					disabled={
						!votingOpen || isVoting
					}
					title={
						!votingOpen
							? 'Jury-avstemning er ikke åpen'
							: undefined
					}
					className={cn(
						'min-h-11 w-full rounded-lg border text-sm font-extrabold transition-all duration-200',
						votingOpen
							? 'border-gold bg-gold text-black hover:-translate-y-px'
							: 'cursor-not-allowed border-gold-light/20 bg-gold-light/10 text-white/50 opacity-60',
					)}
				>
					{isVoting
						? '...'
						: !votingOpen
							? 'Stengt'
							: hasVotedInCategory
								? 'Bytt stemme'
								: 'Stem'}
				</button>
			)}
		</article>
	);
}
