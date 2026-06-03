import { Card } from "@/components/ui/card";
import { NomineeCard } from "./nominee-card";
import type { Category, Nominee, Vote } from "@/types";

interface VoteCardProps {
  category: Category;
  nominees: Nominee[];
  userVote?: Vote;
  onVote: (nomineeId: number) => void;
  votingNomineeId: number | null;
}

export function VoteCard({
  category,
  nominees,
  userVote,
  onVote,
  votingNomineeId,
}: VoteCardProps) {
  const hasVoted = !!userVote;

  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-white">{category.name}</h2>
        {category.description && (
          <p className="mt-1 text-sm text-gold-light">{category.description}</p>
        )}
      </div>
      {nominees.length === 0 ? (
        <p className="text-sm text-gold-light">Ingen nominerte ennå.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {nominees.map((nominee) => (
            <NomineeCard
              key={nominee.id}
              nominee={nominee}
              isSelected={userVote?.nominee_id === nominee.id}
              hasVoted={hasVoted}
              isVoting={votingNomineeId === nominee.id}
              onVote={onVote}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
