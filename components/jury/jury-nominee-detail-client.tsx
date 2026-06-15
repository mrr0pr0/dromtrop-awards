'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Category, Nominee } from '@/types';
import type { JuryVote } from '@/lib/db/jury-votes';
import {
	categorySlug,
	getCategoryLayout,
} from '@/lib/voting/category-layout';
import { NomineeDisplay } from '@/components/voting/nominee-display';
import { Button } from '@/components/ui/button';

interface JuryNomineeDetailClientProps {
	nominee: Nominee;
	category: Category;
	myVotes: JuryVote[];
	nomineeCountInCategory: number;
	votingOpen: boolean;
}

export function JuryNomineeDetailClient({
	nominee,
	category,
	myVotes,
	nomineeCountInCategory,
	votingOpen,
}: JuryNomineeDetailClientProps) {
	const [localVotes, setLocalVotes] = useState<JuryVote[]>(myVotes);
	const [votingKey, setVotingKey] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	const categoryVote = localVotes.find(
		(v) => v.category_id === category.id,
	);
	const hasVotedInCategory = !!categoryVote;
	const isSelected = categoryVote?.nominee_id === nominee.id;
	const isVoting = votingKey === `${category.id}-${nominee.id}`;
	const layout = getCategoryLayout(category.name);

	async function handleVote() {
		if (!votingOpen) return;

		setVotingKey(`${category.id}-${nominee.id}`);
		setError(null);

		try {
			const res = await fetch('/api/jury/vote', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					categoryId: category.id,
					nomineeId: nominee.id,
				}),
			});

			const data = (await res.json()) as {
				error?: string;
				vote?: JuryVote;
			};

			if (!res.ok) {
				setError(data.error || 'Kunne ikke registrere stemme.');
				setVotingKey(null);
				return;
			}

			if (data.vote) {
				const filtered = localVotes.filter(
					(v) => v.category_id !== category.id,
				);
				filtered.push(data.vote);
				setLocalVotes(filtered);
			}
		} catch {
			setError('Nettverksfeil. Prøv igjen.');
		} finally {
			setVotingKey(null);
		}
	}

	return (
		<>
			<Link
				href="/jury"
				className="mb-5 inline-flex min-h-11 items-center text-sm text-gold-light transition-colors hover:text-white"
			>
				← Tilbake til jury-stemming
			</Link>

			{!votingOpen && (
				<p
					className="mb-4 rounded-lg border border-gold-deep/40 bg-gold-deep/20 px-4 py-3 text-sm text-gold-light"
					role="status"
				>
					Jury-avstemning er for øyeblikket stengt.
				</p>
			)}
			{error && (
				<p className="mb-4 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
					{error}
				</p>
			)}

			<section className="grid items-start gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-[clamp(28px,5vw,70px)]">
				<NomineeDisplay
					nominee={nominee}
					category={category}
					variant="media"
					className="hidden lg:block"
				/>

				<div>
					<p className="text-xs font-extrabold uppercase tracking-[0.14em] text-gold-light">
						{category.name}
					</p>
					<h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-medium leading-[0.98] text-gold md:text-7xl lg:text-8xl">
						{nominee.name}
					</h1>

					<div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
						<div className="rounded-[14px] border border-gold/25 bg-charcoal p-4">
							<span className="block text-xs text-gold-light">
								Kategori
							</span>
							<strong className="mt-1 block text-white">
								{category.name}
							</strong>
						</div>
						<div className="rounded-[14px] border border-gold/25 bg-charcoal p-4">
							<span className="block text-xs text-gold-light">
								Status
							</span>
							<strong className="mt-1 block text-white">
								{!votingOpen
									? 'Jury-avstemning stengt'
									: hasVotedInCategory && isSelected
										? 'Jury-stemme registrert'
										: 'Åpen for jury-stemmer'}
							</strong>
						</div>
						<div className="rounded-[14px] border border-gold/25 bg-charcoal p-4">
							<span className="block text-xs text-gold-light">
								Stemmegrense
							</span>
							<strong className="mt-1 block text-white">
								Én per kategori (kan endres)
							</strong>
						</div>
						<div className="rounded-[14px] border border-gold/25 bg-charcoal p-4">
							<span className="block text-xs text-gold-light">
								Nominerte i kategorien
							</span>
							<strong className="mt-1 block text-white">
								{nomineeCountInCategory}
							</strong>
						</div>
					</div>

					{/* Mobile media */}
					<NomineeDisplay
						nominee={nominee}
						category={category}
						variant="media"
						className="mt-6 lg:hidden"
					/>

					{/* Description / content */}
					<NomineeDisplay
						nominee={nominee}
						category={category}
						variant="full"
						className="mt-6"
					/>

					{/* Jury vote button */}
					<div className="mt-6">
						{hasVotedInCategory && isSelected ? (
							<Button
								disabled
								className="min-h-12 w-full border-success bg-success text-white hover:bg-success sm:w-auto"
							>
								Jury-stemmen er registrert ✓
							</Button>
						) : (
							<Button
								onClick={handleVote}
								disabled={!votingOpen || isVoting}
								className="min-h-12 w-full sm:w-auto"
							>
								{isVoting
									? 'Stemmer...'
									: !votingOpen
										? 'Jury-avstemning er stengt'
										: hasVotedInCategory
											? `Bytt jury-stemme til ${nominee.name}`
											: `Stem på ${nominee.name} (jury)`}
							</Button>
						)}
					</div>

					<div className="mt-6 flex flex-wrap gap-3">
						<Link
							href="/jury"
							className="inline-flex min-h-12 items-center rounded-[10px] border border-gold/25 px-4 text-sm font-extrabold text-gold-light transition-all hover:-translate-y-0.5 hover:text-white"
						>
							Se alle kategorier
						</Link>
					</div>
				</div>
			</section>
		</>
	);
}