"use client";

import { useState } from "react";
import type { Category, Nominee, Vote } from "@/types";
import { NomineeCard } from "./nominee-card";

interface CategoryWithNominees {
  category: Category;
  nominees: Nominee[];
}

interface CategoryListProps {
  categories: CategoryWithNominees[];
  userVotes: Vote[];
  currentUserId?: string;
}

export function CategoryList({ categories, userVotes, currentUserId }: CategoryListProps) {
  const [votingKey, setVotingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [localVotes, setLocalVotes] = useState(userVotes);

  async function handleVote(categoryId: number, nomineeId: number) {
    const key = `${categoryId}-${nomineeId}`;
    setVotingKey(key);
    setError(null);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, nomineeId }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Kunne ikke registrere stemme.");
        return;
      }

      setLocalVotes((prev) => {
        const filtered = prev.filter((v) => v.category_id !== categoryId);
        return [
          ...filtered,
          {
            id: 0,
            user_id: "",
            category_id: categoryId,
            nominee_id: nomineeId,
            created_at: new Date(),
          },
        ];
      });
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
    } finally {
      setVotingKey(null);
    }
  }

  if (categories.length === 0) {
    return (
      <p className="text-center text-gold-light">
        Ingen aktive kategorier ennå. Kom tilbake senere.
      </p>
    );
  }

  return (
    <div className="space-y-12">
      {error && (
        <p className="rounded-lg border border-gold-deep/50 bg-gold-deep/20 px-4 py-3 text-sm text-gold-light">
          {error}
        </p>
      )}
      {categories.map(({ category, nominees }) => {
        const categoryVote = localVotes.find(
          (v) => v.category_id === category.id,
        );
        const hasVoted = !!categoryVote;

        return (
          <section key={category.id}>
            <h2 className="text-2xl font-semibold text-white">
              {category.name}
            </h2>
            {category.description && (
              <p className="mt-1 text-sm text-gold-light">
                {category.description}
              </p>
            )}
            <hr className="my-4 border-gold/30" />
            {nominees.length === 0 ? (
              <p className="text-sm text-gold-light">
                Ingen nominerte i denne kategorien ennå.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {nominees.map((nominee) => (
                  <NomineeCard
                    key={nominee.id}
                    nominee={nominee}
                    isSelected={categoryVote?.nominee_id === nominee.id}
                    hasVoted={hasVoted}
                    isVoting={votingKey === `${category.id}-${nominee.id}`}
                    onVote={(id) => handleVote(category.id, id)}
                    isOwnNominee={!!currentUserId && nominee.user_id === currentUserId}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
