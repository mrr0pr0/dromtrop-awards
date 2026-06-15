import Link from 'next/link';
import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/uploads/b2-media';
import type { NomineeWithVotes } from '@/types';

interface RankCardProps {
	nominee: NomineeWithVotes;
}

export function RankCard({ nominee }: RankCardProps) {
	const mediaUrl = resolveMediaUrl(nominee.image_url);

	return (
		<Link
			href={`/vote/nominee/${nominee.id}`}
			className="grid min-h-20 grid-cols-[42px_minmax(0,1fr)] items-center gap-3 rounded-[14px] border border-gold-light/15 bg-parchment/[0.055] px-3 py-3 transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:bg-parchment/[0.09] sm:grid-cols-[48px_64px_minmax(0,1fr)_auto] sm:gap-4"
		>
			<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20 text-sm font-black text-gold tabular-nums">
				{nominee.rank}
			</div>
			{mediaUrl && (
				<div className="relative hidden h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gold-light/15 sm:block">
					<Image
						src={mediaUrl}
						alt={nominee.name}
						fill
						className="object-cover"
						sizes="56px"
						unoptimized={mediaUrl.startsWith('/api/media/')}
					/>
				</div>
			)}
			{!mediaUrl && (
				<div
					aria-hidden="true"
					className="relative hidden h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gold-light/15 bg-[linear-gradient(135deg,rgba(201,168,76,0.22),transparent_38%),linear-gradient(160deg,var(--color-charcoal),var(--color-black))] before:absolute before:left-3 before:right-3 before:top-[18px] before:h-[3px] before:rotate-[-10deg] before:rounded-sm before:bg-gold before:opacity-75 after:absolute after:left-3 after:right-3 after:top-[31px] after:h-[3px] after:rotate-[-10deg] after:rounded-sm after:bg-gold-light after:opacity-45 sm:block"
				/>
			)}
			<div className="min-w-0 flex-1">
				<h3 className="truncate text-base font-semibold leading-tight text-white">
					{nominee.name}
				</h3>
				<p className="mt-1 text-xs font-bold text-gold-light">
					{nominee.vote_count}{' '}
					{nominee.vote_count === 1 ? 'stemme' : 'stemmer'}
				</p>
			</div>
			{nominee.rank === 1 && nominee.vote_count > 0 && (
				<div className="col-start-2 w-fit rounded-full border border-gold/30 bg-gold/15 px-3 py-1.5 text-center text-xs font-black text-gold sm:col-start-auto sm:min-w-20">
					Ledende
				</div>
			)}
		</Link>
	);
}