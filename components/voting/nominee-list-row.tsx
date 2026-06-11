'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Category, Nominee } from '@/types';
import { getCategoryLayout } from '@/lib/voting/category-layout';
import {
	nomineeInitials,
	nomineeSummaryText,
} from './nominee-display';
import { resolveMediaUrl } from '@/lib/uploads/b2-media';
import { isVideoMediaUrl } from '@/lib/utils/media-url';
import { cn } from '@/lib/utils/cn';

function VideoThumbnail({ src, fallback }: { src: string; fallback: string }) {
	const videoRef = useRef<HTMLVideoElement>(null);
	const [poster, setPoster] = useState<string | null>(null);

	useEffect(() => {
		const video = document.createElement('video');
		video.crossOrigin = 'anonymous';
		video.muted = true;
		video.playsInline = true;
		video.src = src;
		video.currentTime = 0.5;

		video.addEventListener('seeked', () => {
			try {
				const canvas = document.createElement('canvas');
				canvas.width = video.videoWidth || 320;
				canvas.height = video.videoHeight || 180;
				const ctx = canvas.getContext('2d');
				if (ctx) {
					ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
					setPoster(canvas.toDataURL('image/jpeg', 0.8));
				}
			} catch {
				// cross-origin or codec issue — just leave poster null
			}
		}, { once: true });

		video.load();
	}, [src]);

	if (poster) {
		return (
			<img
				src={poster}
				alt=""
				className="h-full w-full object-cover"
			/>
		);
	}

	// While loading, show a dark background with a play icon
	return (
		<div className="flex h-full w-full items-center justify-center bg-charcoal">
			<svg
				className="h-7 w-7 text-gold-light/60"
				fill="currentColor"
				viewBox="0 0 24 24"
			>
				<path d="M8 5v14l11-7z" />
			</svg>
		</div>
	);
}

interface NomineeListRowProps {
	nominee: Nominee;
	category: Category;
	hasVotedInCategory: boolean;
	isSelected: boolean;
	isVoting: boolean;
	votingOpen: boolean;
	isOwnNominee: boolean;
	onVote: () => void;
}

export function NomineeListRow({
	nominee,
	category,
	hasVotedInCategory,
	isSelected,
	isVoting,
	votingOpen,
	isOwnNominee,
	onVote,
}: NomineeListRowProps) {
	const layout = getCategoryLayout(category.name);
	const mediaUrl = resolveMediaUrl(nominee.image_url);
	const isVideo = !!mediaUrl && isVideoMediaUrl(mediaUrl);
	const showThumb =
		layout !== 'shortFilm' &&
		layout !== 'originalIdea' &&
		mediaUrl;

	return (
		<article className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 border-b border-gold-light/10 px-4 py-5 transition-all duration-200 last:border-b-0 hover:bg-white/5 hover:-translate-y-px sm:grid-cols-[86px_minmax(0,1fr)_auto] sm:gap-5 sm:px-6">
			<div
				className={cn(
					'flex aspect-square w-16 items-center justify-center overflow-hidden rounded-xl border border-gold-light/20 sm:w-[86px] sm:rounded-[14px]',
					showThumb
						? 'bg-charcoal'
						: 'bg-gradient-to-br from-gold/20 to-gold-light/30 font-[family-name:var(--font-display)] text-2xl font-bold text-gold-light sm:text-[28px]',
				)}
				aria-hidden={!showThumb}
			>
				{showThumb ? (
					isVideo ? (
						<VideoThumbnail src={mediaUrl} fallback={nomineeInitials(nominee.name)} />
					) : (
						<img
							src={mediaUrl}
							alt=""
							className="h-full w-full object-cover"
							onError={(e) => {
								const el = e.currentTarget;
								el.style.display = 'none';
								const parent = el.parentElement;
								if (parent) {
									parent.className = parent.className
										.replace('bg-charcoal', 'bg-gradient-to-br from-gold/20 to-gold-light/30 font-[family-name:var(--font-display)] text-2xl font-bold text-gold-light sm:text-[28px]');
									parent.textContent = nomineeInitials(nominee.name);
								}
							}}
						/>
					)
				) : (
					nomineeInitials(nominee.name)
				)}
			</div>

			<div className="min-w-0">
				<h3 className="text-lg font-medium leading-tight text-white sm:text-xl">
					{nominee.name}
				</h3>
				<p className="mt-1.5 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/70">
					{nomineeSummaryText(nominee)}
				</p>
				<div className="mt-3 flex flex-wrap gap-2">
					<span className="inline-flex min-h-7 items-center rounded-full bg-gold/10 px-2.5 text-xs font-semibold text-gold-light border border-gold-light/25">
						{category.name}
					</span>
					{hasVotedInCategory && isSelected && (
						<span className="inline-flex min-h-7 items-center rounded-full bg-gold/10 px-2.5 text-xs font-semibold text-gold-light border border-gold-light/25">
							Din stemme
						</span>
					)}
				</div>
			</div>

			<div className="col-span-2 grid grid-cols-2 gap-2 sm:col-span-1 sm:grid-cols-1 sm:justify-items-end sm:gap-2.5">
				{isOwnNominee ? (
					<p className="col-span-2 text-center text-xs text-white/60 sm:col-span-1 sm:text-right">
						Kan ikke stemme på deg selv
					</p>
				) : (
					<button
						type="button"
						onClick={onVote}
						disabled={
							!votingOpen ||
							(hasVotedInCategory && isSelected) ||
							isVoting
						}
						title={
							!votingOpen
								? 'Avstemningen er stengt'
								: undefined
						}
						className={cn(
							'min-h-11 w-full rounded-[9px] border text-sm font-extrabold transition-all duration-200 sm:w-[132px]',
							hasVotedInCategory && isSelected
								? 'border-success bg-success text-white'
								: votingOpen
									? 'border-gold bg-gold text-black hover:-translate-y-px'
									: 'cursor-not-allowed border-gold-light/20 bg-gold-light/10 text-white/50 opacity-60',
						)}
					>
						{hasVotedInCategory && isSelected
							? 'Stemt'
							: isVoting
								? '...'
								: !votingOpen
									? 'Stengt'
									: hasVotedInCategory
										? 'Bytt stemme'
										: 'Stem'}
					</button>
				)}
				<Link
					href={`/vote/nominee/${nominee.id}`}
					className="flex min-h-11 w-full items-center justify-center rounded-[9px] border border-gold-light/25 bg-gold-light/5 text-sm font-extrabold text-gold-light transition-all duration-200 hover:-translate-y-px hover:bg-gold-light/10 sm:w-[132px]"
				>
					Se detaljer
				</Link>
			</div>
		</article>
	);
}
