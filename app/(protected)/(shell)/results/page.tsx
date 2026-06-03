export const dynamic = "force-dynamic";

import { getFullLeaderboard, countTotalVotes } from "@/lib/db/votes";
import { countActiveCategories } from "@/lib/db/categories";
import { countApprovedUsers } from "@/lib/db/users";
import { Leaderboard } from "@/components/results/leaderboard";
import { ResultsStats } from "@/components/results/results-stats";

export const revalidate = 0;

export default async function ResultsPage() {
  const [leaderboard, totalVotes, activeCategories, approvedUsers] =
    await Promise.all([
      getFullLeaderboard(),
      countTotalVotes(),
      countActiveCategories(),
      countApprovedUsers(),
    ]);

  return (
    <div className="pb-8">
      <section
        className="mb-7 grid items-end gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]"
        aria-labelledby="results-title"
      >
        <div>
          <p className="mb-2 text-xs font-black uppercase tracking-[0.12em] text-gold-light">
            Live oversikt
          </p>
          <h1
            id="results-title"
            className="font-[family-name:var(--font-display)] text-5xl font-light leading-[0.95] text-gold md:text-7xl"
          >
            Resultater
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/80 md:text-xl">
            Live resultater sortert etter antall stemmer. Vinnerne er enklere å
            skanne, og tomme kategorier tar mindre plass.
          </p>
        </div>
        <ResultsStats
          totalVotes={totalVotes}
          activeCategories={activeCategories}
          approvedUsers={approvedUsers}
        />
      </section>
      <Leaderboard data={leaderboard} />
    </div>
  );
}
