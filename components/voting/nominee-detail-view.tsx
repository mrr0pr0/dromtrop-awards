"use client";

import { useState } from "react";
import Link from "next/link";
import type { Category, Nominee, Vote } from "@/types";
import { categorySlug, getCategoryLayout } from "@/lib/voting/category-layout";
import { NomineeDisplay } from "./nominee-display";
import { Lightbox } from "./lightbox";

interface NomineeDetailViewProps {
  nominee: Nominee;
  category: Category;
  userVotes: Vote[];
  currentUserId: string | undefined;
  nomineeCountInCategory: number;
  votingKey: string | null;
  onVote: (categoryId: number, nomineeId: number) => Promise<void>;
}

export function NomineeDetailView({
  nominee,
  category,
  userVotes,
  currentUserId,
  nomineeCountInCategory,
  votingKey,
  onVote,
}: NomineeDetailViewProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const layout = getCategoryLayout(category.name);

  const categoryVote = userVotes.find((v) => v.category_id === category.id);
  const hasVotedInCategory = !!categoryVote;
  const isSelected = categoryVote?.nominee_id === nominee.id;
  const isVoting = votingKey === `${category.id}-${nominee.id}`;
  const isOwnNominee =
    !!currentUserId && nominee.user_id === currentUserId;

  return (
    <>
      <Link
        href={`/vote#${categorySlug(category.name)}`}
        className="mb-5 inline-flex min-h-11 items-center text-sm text-gold-light transition-colors hover:text-white"
      >
        ← Tilbake til stemming
      </Link>

      <section className="grid items-start gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:gap-[clamp(28px,5vw,70px)]">
        <NomineeDisplay
          nominee={nominee}
          category={category}
          variant="media"
          onImageClick={
            layout === "medie" && nominee.image_url
              ? () => setLightboxOpen(true)
              : undefined
          }
          className="hidden lg:block"
        />

        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-gold-light">
            {category.name}
          </p>
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-5xl font-medium leading-[0.98] text-gold md:text-7xl lg:text-8xl">
            {nominee.name}
          </h1>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[14px] border border-gold/25 bg-charcoal p-4">
              <span className="block text-xs text-gold-light">Kategori</span>
              <strong className="mt-1 block text-white">{category.name}</strong>
            </div>
            <div className="rounded-[14px] border border-gold/25 bg-charcoal p-4">
              <span className="block text-xs text-gold-light">Status</span>
              <strong className="mt-1 block text-white">
                {hasVotedInCategory ? "Stemme registrert" : "Åpen for stemmer"}
              </strong>
            </div>
            <div className="rounded-[14px] border border-gold/25 bg-charcoal p-4">
              <span className="block text-xs text-gold-light">Stemmegrense</span>
              <strong className="mt-1 block text-white">Én gang per kategori</strong>
            </div>
            <div className="rounded-[14px] border border-gold/25 bg-charcoal p-4">
              <span className="block text-xs text-gold-light">
                Nominerte i kategorien
              </span>
              <strong className="mt-1 block text-white">
                {nomineeCountInCategory}
              </strong>
            </div>
          </div>

          <NomineeDisplay
            nominee={nominee}
            category={category}
            variant="media"
            onImageClick={
              layout === "medie" && nominee.image_url
                ? () => setLightboxOpen(true)
                : undefined
            }
            className="mt-6 lg:hidden"
          />

          <NomineeDisplay
            nominee={nominee}
            category={category}
            variant="full"
            showVoteButton
            hasVotedInCategory={hasVotedInCategory}
            isSelected={isSelected}
            isVoting={isVoting}
            isOwnNominee={isOwnNominee}
            onVote={() => onVote(category.id, nominee.id)}
            className="mt-6"
          />

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={`/vote#${categorySlug(category.name)}`}
              className="inline-flex min-h-12 items-center rounded-[10px] border border-gold/25 px-4 text-sm font-extrabold text-gold-light transition-all hover:-translate-y-0.5 hover:text-white"
            >
              Se alle kategorier
            </Link>
          </div>
        </div>
      </section>

      {layout === "medie" && nominee.image_url && (
        <Lightbox
          isOpen={lightboxOpen}
          imageUrl={nominee.image_url}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
