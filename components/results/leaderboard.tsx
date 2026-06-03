import type { CategoryLeaderboard } from '@/types';
import { RankCard } from './rank-card';

interface LeaderboardProps {
	data: CategoryLeaderboard[];
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '');
}

function nomineeCountLabel(count: number) {
	return `${count} ${count === 1 ? 'nominert' : 'nominerte'}`;
}

export function Leaderboard({ data }: LeaderboardProps) {
	if (data.length === 0) {
		return (
			<div className="rounded-[18px] border border-dashed border-gold-light/25 bg-parchment/[0.035] p-8 text-center text-sm font-bold text-gold-light">
				Ingen resultater å vise ennå.
			</div>
		);
	}

	return (
		<>
			<section
				className="sticky top-3 z-10 mb-7 grid gap-3 rounded-2xl border border-gold-light/20 bg-black/90 p-3 backdrop-blur md:grid-cols-[minmax(0,1fr)_auto]"
				aria-label="Kategorier"
			>
				<div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					{data.map(({ category }) => (
						<a
							key={category.id}
							className="flex min-h-10 shrink-0 items-center justify-center rounded-full border border-gold-light/25 bg-parchment/[0.04] px-4 text-xs font-bold text-gold-light transition-colors hover:border-gold hover:bg-gold/10 hover:text-white focus-visible:border-gold focus-visible:bg-gold/10 focus-visible:text-white focus-visible:outline-none"
							href={`#${slugify(category.name)}`}
						>
							{category.name}
						</a>
					))}
				</div>
				<span className="text-xs text-white/60 md:self-center md:whitespace-nowrap">
					Oppdateres når stemmer kommer inn
				</span>
			</section>

			<section
				className="grid gap-4"
				aria-label="Resultatliste"
			>
				{data.map(({ category, nominees }) => (
					<article
						key={category.id}
						id={slugify(category.name)}
						className="motion-safe:animate-[rise_600ms_ease_both] scroll-mt-24 grid gap-5 rounded-[18px] border border-gold-light/20 bg-charcoal/60 p-5 md:grid-cols-[minmax(220px,0.42fr)_minmax(0,1fr)] lg:p-6"
					>
						<div className="flex flex-col gap-3 md:pr-2">
							<span className="w-fit rounded-full bg-gold/10 px-3 py-1 text-xs font-black text-gold-light">
								{nomineeCountLabel(nominees.length)}
							</span>
							<h2 className="text-2xl font-semibold leading-tight text-white md:text-3xl">
								{category.name}
							</h2>
							<p className="max-w-[30ch] text-sm text-white/65">
								{category.description ||
									(nominees.length === 0
										? 'Kategorien er klar, men har ingen registrerte nominerte ennå.'
										: 'Nominerte sorteres automatisk etter antall stemmer.')}
							</p>
						</div>
						{nominees.length === 0 ? (
							<div className="grid min-h-20 content-center rounded-[14px] border border-dashed border-gold-light/20 bg-parchment/[0.035] p-5 text-sm font-bold text-gold-light/80">
								Ingen nominerte.
							</div>
						) : (
							<div className="grid gap-2.5">
								{nominees.map((nominee) => (
									<RankCard
										key={nominee.id}
										nominee={nominee}
									/>
								))}
							</div>
						)}
					</article>
				))}
			</section>
		</>
	);
}
