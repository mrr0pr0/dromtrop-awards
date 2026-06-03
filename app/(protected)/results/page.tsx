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
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-light text-gold md:text-5xl">
        Resultater
      </h1>
      <p className="mt-2 text-sm text-gold-light">
        Live resultater sortert etter antall stemmer.
      </p>
      <div className="mt-8">
        <ResultsStats
          totalVotes={totalVotes}
          activeCategories={activeCategories}
          approvedUsers={approvedUsers}
        />
        <Leaderboard data={leaderboard} />
      </div>
    </div>
  );
}
