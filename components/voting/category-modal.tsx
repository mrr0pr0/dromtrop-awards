"use client";

import { useState } from "react";
import type { Category, Nominee, Vote } from "@/types";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Lightbox } from "./lightbox";

interface CategoryModalProps {
  category: Category;
  nominees: Nominee[];
  userVotes: Vote[];
  currentUserId: string | undefined;
  votingKey: string | null;
  isOpen: boolean;
  onVote: (categoryId: number, nomineeId: number) => Promise<void>;
  onClose: () => void;
}

function normalizeCategory(name: string): string {
  return name.trim().toLowerCase();
}

function NomineeCard({
  nominee,
  category,
  hasVoted,
  isVoting,
  onVote,
  onImageClick,
}: {
  nominee: Nominee;
  category: Category;
  hasVoted: boolean;
  isVoting: boolean;
  onVote: () => void;
  onImageClick?: () => void;
}) {
  const categoryName = normalizeCategory(category.name);

  // 1. Beste medieproduksjon / Beste medieprudukt
  if (
    categoryName.includes("beste medieproduksjon") ||
    categoryName.includes("beste medieprudukt")
  ) {
    return (
      <div className="rounded-lg bg-black/40 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gold">{nominee.name}</h3>
        {nominee.image_url && (
          <img
            src={nominee.image_url}
            alt={nominee.name}
            onClick={onImageClick}
            className="mb-3 w-full cursor-pointer rounded-lg transition-opacity hover:opacity-80"
          />
        )}
        {nominee.description && (
          <p className="mb-4 text-sm text-gold-light">{nominee.description}</p>
        )}
        <Button
          onClick={onVote}
          disabled={hasVoted || isVoting}
          className="w-full"
        >
          {hasVoted ? "✓ Stemt" : isVoting ? "..." : "Stem"}
        </Button>
      </div>
    );
  }

  // 2. Beste IT-produkt / Beste app
  if (
    categoryName.includes("beste it-produkt") ||
    categoryName.includes("beste app")
  ) {
    return (
      <div className="rounded-lg bg-black/40 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gold">{nominee.name}</h3>
        {nominee.image_url && (
          <img
            src={nominee.image_url}
            alt={nominee.name}
            className="mb-3 w-full rounded-lg"
          />
        )}
        {nominee.description && (
          <p className="mb-3 text-sm text-gold-light">{nominee.description}</p>
        )}
        {nominee.site_url && (
          <a
            href={nominee.site_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 inline-block text-sm text-gold hover:text-gold-light hover:underline"
          >
            Besøk produkt →
          </a>
        )}
        <Button
          onClick={onVote}
          disabled={hasVoted || isVoting}
          className="w-full"
        >
          {hasVoted ? "✓ Stemt" : isVoting ? "..." : "Stem"}
        </Button>
      </div>
    );
  }

  // 3. Beste konsept
  if (categoryName.includes("beste konsept")) {
    return (
      <div className="rounded-lg bg-black/40 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gold">{nominee.name}</h3>
        {nominee.image_url && (
          <img
            src={nominee.image_url}
            alt={nominee.name}
            className="mb-3 w-full rounded-lg"
          />
        )}
        {nominee.description && (
          <p className="mb-4 text-sm text-gold-light">{nominee.description}</p>
        )}
        <Button
          onClick={onVote}
          disabled={hasVoted || isVoting}
          className="w-full"
        >
          {hasVoted ? "✓ Stemt" : isVoting ? "..." : "Stem"}
        </Button>
      </div>
    );
  }

  // 4. Beste kortfilm
  if (categoryName.includes("beste kortfilm")) {
    return (
      <div className="rounded-lg bg-black/40 p-4">
        {nominee.description && (
          <p className="mb-4 text-sm text-gold-light">{nominee.description}</p>
        )}
        {nominee.video_url && (
          <iframe
            src={nominee.video_url}
            className="mb-4 w-full rounded-lg"
            style={{ aspectRatio: "16 / 9" }}
            allowFullScreen
          />
        )}
        <Button
          onClick={onVote}
          disabled={hasVoted || isVoting}
          className="w-full"
        >
          {hasVoted ? "✓ Stemt" : isVoting ? "..." : "Stem"}
        </Button>
      </div>
    );
  }

  // 5. Mest originale idé
  if (categoryName.includes("mest originale idé")) {
    return (
      <div className="rounded-lg bg-black/40 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gold">{nominee.name}</h3>
        {nominee.description && (
          <p className="mb-4 text-sm text-gold-light">{nominee.description}</p>
        )}
        {nominee.what_we_made && (
          <div className="mb-4 rounded border border-gold/20 bg-black/30 p-3">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gold">
              Hva vi lagde
            </h4>
            <p className="text-sm text-gold-light">{nominee.what_we_made}</p>
          </div>
        )}
        <Button
          onClick={onVote}
          disabled={hasVoted || isVoting}
          className="w-full"
        >
          {hasVoted ? "✓ Stemt" : isVoting ? "..." : "Stem"}
        </Button>
      </div>
    );
  }

  // 6. Beste interaktiv
  if (categoryName.includes("beste interaktiv")) {
    return (
      <div className="rounded-lg bg-black/40 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gold">{nominee.name}</h3>
        {nominee.description && (
          <p className="mb-4 text-sm text-gold-light">{nominee.description}</p>
        )}
        {nominee.site_url && (
          <a
            href={nominee.site_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 inline-block rounded-lg bg-gold/20 px-4 py-2 text-sm font-semibold text-gold transition-colors hover:bg-gold/30 hover:text-gold-light"
          >
            Åpne interaktivt →
          </a>
        )}
        <Button
          onClick={onVote}
          disabled={hasVoted || isVoting}
          className="w-full"
        >
          {hasVoted ? "✓ Stemt" : isVoting ? "..." : "Stem"}
        </Button>
      </div>
    );
  }

  // 7. Beste animasjon
  if (categoryName.includes("beste animasjon")) {
    return (
      <div className="rounded-lg bg-black/40 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gold">{nominee.name}</h3>
        {nominee.image_url && (
          <img
            src={nominee.image_url}
            alt={nominee.name}
            className="mb-4 w-full rounded-lg"
          />
        )}
        <Button
          onClick={onVote}
          disabled={hasVoted || isVoting}
          className="w-full"
        >
          {hasVoted ? "✓ Stemt" : isVoting ? "..." : "Stem"}
        </Button>
      </div>
    );
  }

  // 8. Beste historiefortelling
  if (categoryName.includes("beste historiefortelling")) {
    return (
      <div className="rounded-lg bg-black/40 p-4">
        <h3 className="mb-3 text-lg font-semibold text-gold">{nominee.name}</h3>
        {nominee.image_url && (
          <img
            src={nominee.image_url}
            alt={nominee.name}
            className="mb-3 w-full rounded-lg"
          />
        )}
        {nominee.description && (
          <p className="mb-4 text-sm text-gold-light">{nominee.description}</p>
        )}
        <Button
          onClick={onVote}
          disabled={hasVoted || isVoting}
          className="w-full"
        >
          {hasVoted ? "✓ Stemt" : isVoting ? "..." : "Stem"}
        </Button>
      </div>
    );
  }

  // Fallback layout
  return (
    <div className="rounded-lg bg-black/40 p-4">
      <h3 className="mb-3 text-lg font-semibold text-gold">{nominee.name}</h3>
      {nominee.image_url && (
        <img
          src={nominee.image_url}
          alt={nominee.name}
          className="mb-3 w-full rounded-lg"
        />
      )}
      <Button
        onClick={onVote}
        disabled={hasVoted || isVoting}
        className="w-full"
      >
        {hasVoted ? "✓ Stemt" : isVoting ? "..." : "Stem"}
      </Button>
    </div>
  );
}

export function CategoryModal({
  category,
  nominees,
  userVotes,
  currentUserId,
  votingKey,
  isOpen,
  onVote,
  onClose,
}: CategoryModalProps) {
  const [lightboxNominee, setLightboxNominee] = useState<Nominee | null>(null);
  const categoryName = normalizeCategory(category.name);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={category.name}>
        <div className="max-h-[70vh] overflow-y-auto">
          {categoryName.includes("beste kortfilm") ? (
            // Kortfilm: vertical stack
            <div className="space-y-6">
              {nominees.map((nominee) => {
                const hasVoted =
                  userVotes.some(
                    (v) =>
                      v.category_id === category.id &&
                      v.nominee_id === nominee.id
                  ) || false;
                const isVoting = votingKey === `${category.id}-${nominee.id}`;

                return (
                  <NomineeCard
                    key={nominee.id}
                    nominee={nominee}
                    category={category}
                    hasVoted={hasVoted}
                    isVoting={isVoting}
                    onVote={() => onVote(category.id, nominee.id)}
                  />
                );
              })}
            </div>
          ) : (
            // Other categories: responsive grid
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {nominees.map((nominee) => {
                const hasVoted =
                  userVotes.some(
                    (v) =>
                      v.category_id === category.id &&
                      v.nominee_id === nominee.id
                  ) || false;
                const isVoting = votingKey === `${category.id}-${nominee.id}`;

                return (
                  <NomineeCard
                    key={nominee.id}
                    nominee={nominee}
                    category={category}
                    hasVoted={hasVoted}
                    isVoting={isVoting}
                    onVote={() => onVote(category.id, nominee.id)}
                    onImageClick={
                      categoryName.includes("beste medieproduksjon") ||
                      categoryName.includes("beste medieprudukt")
                        ? () => setLightboxNominee(nominee)
                        : undefined
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* Lightbox for Beste medieproduksjon */}
      {lightboxNominee && (
        <Lightbox
          isOpen={true}
          imageUrl={lightboxNominee.image_url || ""}
          onClose={() => setLightboxNominee(null)}
        />
      )}
    </>
  );
}
