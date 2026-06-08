'use client';

import type { Category, Nominee } from '@/types';
import { getCategoryLayout } from '@/lib/voting/category-layout';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export function nomineeInitials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return '?';
	if (parts.length === 1)
		return parts[0].slice(0, 2).toUpperCase();
	return (
		parts[0][0] + parts[parts.length - 1][0]
	).toUpperCase();
}

function truncate(text: string, max: number): string {
	if (text.length <= max) return text;
	return `${text.slice(0, max).trim()}…`;
}

interface NomineeDisplayProps {
	nominee: Nominee;
	category: Category;
	variant: 'full' | 'media';
	onImageClick?: () => void;
	showVoteButton?: boolean;
	hasVotedInCategory?: boolean;
	isSelected?: boolean;
	isVoting?: boolean;
	votingOpen?: boolean;
	isOwnNominee?: boolean;
	onVote?: () => void;
	className?: string;
}

export function NomineeDisplay({
	nominee,
	category,
	variant,
	onImageClick,
	showVoteButton = false,
	hasVotedInCategory = false,
	isSelected = false,
	isVoting = false,
	votingOpen = true,
	isOwnNominee = false,
	onVote,
	className,
}: NomineeDisplayProps) {
	const layout = getCategoryLayout(category.name);

	if (variant === 'media') {
		return (
			<div
				className={cn(
					'relative min-h-[300px] overflow-hidden rounded-[20px] border border-gold/25 bg-gradient-to-br from-black via-charcoal to-gold-deep/30 md:min-h-[400px] lg:min-h-[560px]',
					className,
				)}
			>
				{layout === 'shortFilm' && nominee.video_url ? (
					<iframe
						src={nominee.video_url}
						title={nominee.name}
						className="absolute inset-0 h-full w-full"
						allowFullScreen
					/>
				) : nominee.image_url ? (
					<img
						src={nominee.image_url}
						alt={nominee.name}
						onClick={
							layout === 'medie' ? onImageClick : undefined
						}
						className={cn(
							'h-full w-full object-cover',
							layout === 'medie' &&
								onImageClick &&
								'cursor-pointer',
						)}
					/>
				) : (
					<div className="flex h-full min-h-[300px] items-center justify-center font-[family-name:var(--font-display)] text-6xl font-light text-gold/40">
						{nomineeInitials(nominee.name)}
					</div>
				)}
			</div>
		);
	}

	const voteBlock =
		showVoteButton && onVote ? (
			<div className="mt-6">
				{isOwnNominee ? (
					<p className="text-sm text-gold-light">
						Du kan ikke stemme på deg selv
					</p>
				) : (
					<Button
						onClick={onVote}
						disabled={
							!votingOpen ||
							(hasVotedInCategory && isSelected) ||
							isVoting
						}
						className={cn(
							'min-h-12 w-full sm:w-auto',
							hasVotedInCategory &&
								isSelected &&
								'border-success bg-success text-white hover:bg-success',
						)}
					>
						{hasVotedInCategory && isSelected
							? 'Stemmen er registrert'
							: isVoting
								? 'Stemmer...'
								: !votingOpen
									? 'Avstemningen er stengt'
									: hasVotedInCategory
										? `Bytt stemme til ${nominee.name}`
										: `Stem på ${nominee.name}`}
					</Button>
				)}
			</div>
		) : null;

	if (layout === 'medie') {
		return (
			<div className={className}>
				<h3 className="text-lg font-semibold text-gold md:hidden">
					{nominee.name}
				</h3>
				{nominee.image_url && (
					<img
						src={nominee.image_url}
						alt={nominee.name}
						onClick={onImageClick}
						className="mb-3 w-full cursor-pointer rounded-lg transition-opacity hover:opacity-80 md:hidden"
					/>
				)}
				{nominee.description && (
					<p className="mb-4 text-sm leading-relaxed text-gold-light">
						{nominee.description}
					</p>
				)}
				{voteBlock}
			</div>
		);
	}

	if (layout === 'itProduct') {
		return (
			<div className={className}>
				{nominee.image_url && (
					<img
						src={nominee.image_url}
						alt={nominee.name}
						className="mb-3 w-full rounded-lg md:hidden"
					/>
				)}
				{nominee.description && (
					<p className="mb-3 text-sm leading-relaxed text-gold-light">
						{nominee.description}
					</p>
				)}
				{nominee.site_url && (
					<a
						href={nominee.site_url}
						target="_blank"
						rel="noopener noreferrer"
						className="mb-4 inline-block text-sm font-semibold text-gold hover:text-gold-light hover:underline"
					>
						Besøk produkt →
					</a>
				)}
				{voteBlock}
			</div>
		);
	}

	if (layout === 'concept') {
		return (
			<div className={className}>
				{nominee.image_url && (
					<img
						src={nominee.image_url}
						alt={nominee.name}
						className="mb-3 w-full rounded-lg md:hidden"
					/>
				)}
				{nominee.description && (
					<p className="mb-4 text-sm leading-relaxed text-gold-light">
						{nominee.description}
					</p>
				)}
				{voteBlock}
			</div>
		);
	}

	if (layout === 'shortFilm') {
		return (
			<div className={className}>
				{nominee.description && (
					<p className="mb-4 text-sm leading-relaxed text-gold-light">
						{nominee.description}
					</p>
				)}
				{nominee.video_url && (
					<iframe
						src={nominee.video_url}
						title={nominee.name}
						className="mb-4 w-full rounded-lg md:hidden"
						style={{ aspectRatio: '16 / 9' }}
						allowFullScreen
					/>
				)}
				{voteBlock}
			</div>
		);
	}

	if (layout === 'originalIdea') {
		return (
			<div className={className}>
				{nominee.description && (
					<p className="mb-4 text-sm leading-relaxed text-gold-light">
						{nominee.description}
					</p>
				)}
				{nominee.what_we_made && (
					<div className="mb-4 rounded-lg border border-gold/20 bg-black/30 p-4">
						<h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold">
							Hva vi lagde
						</h4>
						<p className="text-sm leading-relaxed text-gold-light">
							{nominee.what_we_made}
						</p>
					</div>
				)}
				{voteBlock}
			</div>
		);
	}

	if (layout === 'interactive') {
		return (
			<div className={className}>
				{nominee.description && (
					<p className="mb-4 text-sm leading-relaxed text-gold-light">
						{nominee.description}
					</p>
				)}
				{nominee.site_url && (
					<a
						href={nominee.site_url}
						target="_blank"
						rel="noopener noreferrer"
						className="mb-4 inline-flex min-h-11 items-center rounded-lg bg-gold/20 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/30 hover:text-gold-light"
					>
						Åpne interaktivt →
					</a>
				)}
				{voteBlock}
			</div>
		);
	}

	if (layout === 'animation') {
		return (
			<div className={className}>
				{nominee.image_url && (
					<img
						src={nominee.image_url}
						alt={nominee.name}
						className="mb-4 w-full rounded-lg md:hidden"
					/>
				)}
				{voteBlock}
			</div>
		);
	}

	if (layout === 'storytelling') {
		return (
			<div className={className}>
				{nominee.image_url && (
					<img
						src={nominee.image_url}
						alt={nominee.name}
						className="mb-3 w-full rounded-lg md:hidden"
					/>
				)}
				{nominee.description && (
					<p className="mb-4 text-sm leading-relaxed text-gold-light">
						{nominee.description}
					</p>
				)}
				{voteBlock}
			</div>
		);
	}

	return (
		<div className={className}>
			{nominee.image_url && (
				<img
					src={nominee.image_url}
					alt={nominee.name}
					className="mb-3 w-full rounded-lg"
				/>
			)}
			{nominee.description && (
				<p className="mb-4 text-sm text-gold-light">
					{nominee.description}
				</p>
			)}
			{voteBlock}
		</div>
	);
}

export function nomineeSummaryText(
	nominee: Nominee,
): string {
	return nominee.description
		? truncate(nominee.description, 120)
		: 'Ingen beskrivelse ennå.';
}
