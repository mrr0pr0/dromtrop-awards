'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import type { Nominee } from '@/types';

interface NomineeCardProps {
	nominee: Nominee;
	isSelected: boolean;
	hasVoted: boolean;
	isVoting: boolean;
	onVote: (nomineeId: number) => void;
	isOwnNominee?: boolean;
}

export function NomineeCard({
	nominee,
	isSelected,
	hasVoted,
	isVoting,
	onVote,
	isOwnNominee,
}: NomineeCardProps) {
	return (
		<div
			className={cn(
				'flex flex-col overflow-hidden rounded-lg border transition-all duration-200',
				isSelected
					? 'border-gold bg-gold/10'
					: 'border-gold/20 bg-charcoal hover:border-gold/40',
			)}
		>
			{nominee.image_url && (
				<div className="relative aspect-video w-full bg-black">
					<Image
						src={nominee.image_url}
						alt={nominee.name}
						fill
						className="object-cover"
						sizes="(max-width: 768px) 100vw, 300px"
					/>
				</div>
			)}
			<div className="flex flex-1 flex-col gap-3 p-4">
				<h3 className="font-medium text-white">
					{nominee.name}
				</h3>
				{isSelected && hasVoted ? (
					<p className="text-xs text-gold-light">Din stemme</p>
				) : isOwnNominee ? (
					<p className="text-xs text-gold-light">
						Du kan ikke stemme på deg selv
					</p>
				) : (
					<Button
						variant={isSelected ? 'outline' : 'primary'}
						className="mt-auto w-full"
						disabled={isVoting}
						onClick={() => onVote(nominee.id)}
					>
						{isVoting
							? 'Stemmer...'
							: hasVoted
								? 'Bytt stemme'
								: 'Stem'}
					</Button>
				)}
			</div>
		</div>
	);
}
