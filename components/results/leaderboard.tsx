import type { CategoryLeaderboard } from "@/types";
import { RankCard } from "./rank-card";

interface LeaderboardProps {
  data: CategoryLeaderboard[];
}

export function Leaderboard({ data }: LeaderboardProps) {
  if (data.length === 0) {
    return (
      <p className="text-center text-gold-light">
        Ingen resultater å vise ennå.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {data.map(({ category, nominees }) => (
        <section key={category.id}>
          <h2 className="text-2xl font-semibold text-white">{category.name}</h2>
          <hr className="my-4 border-gold/30" />
          {nominees.length === 0 ? (
            <p className="text-sm text-gold-light">Ingen nominerte.</p>
          ) : (
            <div className="space-y-3">
              {nominees.map((nominee) => (
                <RankCard key={nominee.id} nominee={nominee} />
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
