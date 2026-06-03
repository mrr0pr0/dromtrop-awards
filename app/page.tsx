import Link from 'next/link';
import { auth } from '@/auth';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { listCategories } from '@/lib/db/categories';
import { countNomineesByCategory } from '@/lib/db/nominees';
import { categorySlug } from '@/lib/voting/category-layout';

// Regenerate at most every 30 seconds instead of hitting the DB on every request
export const revalidate = 30;

export default async function HomePage() {
	const session = await auth();
	const user = session?.user;
	const isLoggedIn = !!user?.email;
	const isApproved = user?.status === 'approved';

	const categories = await listCategories(true);
	const nomineeCounts = await countNomineesByCategory();

	return (
		<>
			<Navbar />
			<main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-10 md:py-16 lg:py-20">
				<section className="grid items-center gap-8 border-b border-gold/25 pb-12 md:grid-cols-[1.05fr_0.75fr] md:gap-14 md:pb-20 lg:pb-24">
					<div>
						<p className="text-xs font-extrabold uppercase tracking-[0.14em] text-gold-light">
							Drømtorp videregående skole
						</p>
						<h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-medium leading-[0.98] text-gold md:text-7xl lg:text-8xl">
							Drømtorp Awards 2026
						</h1>
						<p className="mt-5 max-w-xl text-lg leading-relaxed text-gold-light md:text-xl">
							Drømtorp Awards er en konkurranse for
							VG1-elever innen Medie og IT. Elevene skal
							lage et kreativt prosjekt basert på ulike
							temaer og vise frem sine ferdigheter innen
							digitale medier og teknologi.
						</p>
						<Link
							href={isApproved ? '/vote' : '/login'}
							className="mt-7 inline-flex min-h-12 items-center justify-center rounded-[10px] bg-gold px-5 font-extrabold text-black transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105"
						>
							{isLoggedIn && isApproved
								? 'Stem nå'
								: 'Logg inn for å stemme'}
						</Link>
					</div>
					<div
						className="relative min-h-[240px] overflow-hidden rounded-[20px] border border-gold/25 bg-gradient-to-br from-charcoal via-charcoal to-gold-deep/40 md:min-h-[330px]"
						aria-hidden
					>
						<div className="absolute inset-7 rounded-full rounded-b-[20px] border border-gold-light/40 opacity-50" />
						<span className="absolute bottom-7 left-8 font-[family-name:var(--font-display)] text-5xl text-gold opacity-90 md:text-7xl">
							Awards
						</span>
					</div>
				</section>

				<section className="pt-10 md:pt-12">
					<div className="flex flex-col gap-4 border-t border-gold/25 pt-8 sm:flex-row sm:items-end sm:justify-between">
						<h2 className="font-[family-name:var(--font-display)] text-3xl text-white md:text-4xl">
							Kategorier
						</h2>
						<p className="max-w-md text-sm text-gold-light"></p>
					</div>

					<div
						className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
						aria-label="Award-kategorier"
					>
						{categories.map((category) => {
							const count = nomineeCounts[category.id] ?? 0;
							const href = isApproved
								? `/vote#${categorySlug(category.name)}`
								: '/login';
							const statusLabel =
								count === 0
									? 'Ingen nominerte ennå'
									: count === 1
										? '1 nominert'
										: `${count} nominerte`;

							return (
								<Link
									key={category.id}
									href={href}
									className="group min-h-[138px] rounded-[14px] border border-gold/25 bg-charcoal p-4 transition-all duration-200 hover:-translate-y-1 hover:border-gold"
								>
									<strong className="block text-lg text-white group-hover:text-gold-light">
										{category.name}
									</strong>
									{category.description && (
										<span className="mt-2 block text-sm text-gold-light">
											{category.description}
										</span>
									)}
									<em className="mt-5 block text-sm font-extrabold not-italic text-gold">
										{statusLabel}
									</em>
								</Link>
							);
						})}
					</div>
				</section>
			</main>
			<Footer />
		</>
	);
}
