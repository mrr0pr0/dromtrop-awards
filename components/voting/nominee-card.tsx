"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/button";
import type { Nominee } from "@/types";

interface NomineeCardProps {
  nominee: Nominee;
  isSelected: boolean;
  hasVoted: boolean;
  isVoting: boolean;
  onVote: (nomineeId: number) => void;
}

export function NomineeCard({
  nominee,
  isSelected,
  hasVoted,
  isVoting,
  onVote,
}: NomineeCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-lg border transition-all duration-200",
        isSelected
          ? "border-gold bg-gold/10"
          : "border-gold/20 bg-charcoal hover:border-gold/40",
      )}
    >
      {nominee.image_url && (
        <div className="relative aspect-video w-full bg-black">
          <Image
            src={nominee.image_url}
            alt={nominee.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 300px"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-medium text-white">{nominee.name}</h3>
        {hasVoted ? (
          <p className="text-xs text-gold-light">
            {isSelected ? "Din stemme" : "Du har allerede stemt i denne kategorien"}
          </p>
        ) : (
          <Button
            variant={isSelected ? "outline" : "primary"}
            className="mt-auto w-full"
            disabled={isVoting}
            onClick={() => onVote(nominee.id)}
          >
            {isVoting ? "Stemmer..." : "Stem"}
          </Button>
        )}
      </div>
    </div>
  );
}
