'use client';

import { useState } from 'react';
import type { Category, Nominee, Vote } from '@/types';
import { NomineeDetailView } from './nominee-detail-view';

interface NomineeDetailClientProps {
	nominee: Nominee;
	category: Category;
	userVotes: Vote[];
	currentUserId: string | undefined;
	nomineeCountInCategory: number;
}

export function NomineeDetailClient({
	nominee,
	category,
	userVotes,
	currentUserId,
	nomineeCountInCategory,
}: NomineeDetailClientProps) {
	const [localVotes, setLocalVotes] =
		useState<Vote[]>(userVotes);
	const [votingKey, setVotingKey] = useState<string | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);

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
		} catch {
			setError('Nettverksfeil. Prøv igjen.');
		} finally {
			setVotingKey(null);
		}
	}

	return (
		<>
			{error && (
				<p className="mb-4 rounded-lg border border-gold-deep/40 bg-gold-deep/20 px-4 py-3 text-sm text-gold-light">
					{error}
				</p>
			)}
			<NomineeDetailView
				nominee={nominee}
				category={category}
				userVotes={localVotes}
				currentUserId={currentUserId}
				nomineeCountInCategory={nomineeCountInCategory}
				votingKey={votingKey}
				onVote={handleVote}
			/>
		</>
	);
}
