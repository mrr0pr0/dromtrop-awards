"use client";

import { useState, useEffect } from "react";
import type { Category, Nominee, Vote } from "@/types";
import { CategoryModal } from "./category-modal";

interface CategoryPickerProps {
  categories: Category[];
  nominees: Record<number, Nominee[]>;
  userVotes: Vote[];
  currentUserId: string | undefined;
}

export function CategoryPicker({
  categories,
  nominees,
  userVotes,
  currentUserId,
}: CategoryPickerProps) {
  const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);
  const [localVotes, setLocalVotes] = useState<Vote[]>(userVotes);
  const [votingKey, setVotingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalVotes(userVotes);
  }, [userVotes]);

  async function handleVote(categoryId: number, nomineeId: number) {
    if (!currentUserId) return;

    setVotingKey(`${categoryId}-${nomineeId}`);
    setError(null);

    try {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, nomineeId }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Kunne ikke registrere stemme.");
        setVotingKey(null);
        return;
      }

      // Optimistic update: remove old vote in this category, add new vote
      const newVotes = localVotes.filter((v) => v.category_id !== categoryId);
      newVotes.push({
        id: 0, // Placeholder
        user_id: currentUserId,
        category_id: categoryId,
        nominee_id: nomineeId,
        created_at: new Date(),
      });
      setLocalVotes(newVotes);
      setVotingKey(null);
    } catch (err) {
      setError("Nettverksfeil. Prøv igjen.");
      setVotingKey(null);
    }
  }

  const selectedCategory = categories.find((c) => c.id === openCategoryId);
  const selectedNominees = selectedCategory ? nominees[selectedCategory.id] || [] : [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-gold-deep/50 bg-gold-deep/20 p-4 text-sm text-gold">
          {error}
        </div>
      )}

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => setOpenCategoryId(category.id)}
            className="group rounded-lg border border-gold/20 bg-charcoal p-6 transition-all duration-200 hover:border-gold hover:bg-charcoal/80 hover:shadow-lg hover:shadow-gold/20"
          >
            <h3 className="mb-2 text-lg font-semibold text-gold group-hover:text-gold-light">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-sm text-gold-light">{category.description}</p>
            )}
          </button>
        ))}
      </div>

      {/* Category Modal */}
      {selectedCategory && (
        <CategoryModal
          category={selectedCategory}
          nominees={selectedNominees}
          userVotes={localVotes}
          currentUserId={currentUserId}
          votingKey={votingKey}
          isOpen={openCategoryId !== null}
          onVote={handleVote}
          onClose={() => setOpenCategoryId(null)}
        />
      )}
    </div>
  );
}
