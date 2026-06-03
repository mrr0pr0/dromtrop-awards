"use client";

import type { Category } from "@/types";
import { categorySlug } from "@/lib/voting/category-layout";
import { cn } from "@/lib/utils/cn";

interface VoteSidebarProps {
  categories: Category[];
  nomineeCounts: Record<number, number>;
  activeSlug: string | null;
  onNavigate: (slug: string) => void;
}

export function VoteSidebar({
  categories,
  nomineeCounts,
  activeSlug,
  onNavigate,
}: VoteSidebarProps) {
  return (
    <aside
      className="sticky top-[92px] grid gap-2 rounded-[14px] border border-gold-light/20 bg-black/40 p-3 backdrop-blur max-lg:grid-flow-col max-lg:auto-cols-[minmax(190px,1fr)] max-lg:overflow-x-auto max-lg:static"
      aria-label="Kategorier"
    >
      {categories.map((category) => {
        const slug = categorySlug(category.name);
        const count = nomineeCounts[category.id] ?? 0;
        const isActive = activeSlug === slug;

        return (
          <a
            key={category.id}
            href={`#${slug}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate(slug);
            }}
            className={cn(
              "grid min-h-11 grid-cols-[1fr_auto] items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm leading-tight text-white/70 transition-colors max-lg:grid-cols-1 max-lg:gap-1",
              isActive
                ? "bg-gold/10 text-gold-light border border-gold-light/25"
                : "hover:bg-gold/5 border border-transparent",
            )}
          >
            <span>{category.name}</span>
            <span className="font-mono text-xs font-extrabold text-gold-light max-lg:hidden">
              {count}
            </span>
          </a>
        );
      })}
    </aside>
  );
}
