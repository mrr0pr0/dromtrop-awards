import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import type { NomineeWithVotes } from "@/types";

interface RankCardProps {
  nominee: NomineeWithVotes;
}

export function RankCard({ nominee }: RankCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-gold/20 bg-charcoal p-4 transition-all duration-200">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/20 font-semibold text-gold">
        {nominee.rank}
      </div>
      {nominee.image_url && (
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={nominee.image_url}
            alt={nominee.name}
            fill
            className="object-cover"
            sizes="56px"
          />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-medium text-white">{nominee.name}</p>
        <p className="text-xs text-gold-light">
          {nominee.vote_count}{" "}
          {nominee.vote_count === 1 ? "stemme" : "stemmer"}
        </p>
      </div>
      {nominee.rank === 1 && nominee.vote_count > 0 && (
        <Badge variant="gold">Ledende</Badge>
      )}
    </div>
  );
}
