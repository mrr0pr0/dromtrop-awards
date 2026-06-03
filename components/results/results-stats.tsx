interface ResultsStatsProps {
  totalVotes: number;
  activeCategories: number;
  approvedUsers: number;
}

export function ResultsStats({
  totalVotes,
  activeCategories,
  approvedUsers,
}: ResultsStatsProps) {
  const stats = [
    { label: "Totalt antall stemmer", value: totalVotes },
    { label: "Aktive kategorier", value: activeCategories },
    { label: "Godkjente brukere", value: approvedUsers },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:gap-4">
      {stats.map((stat) => (
        <article
          key={stat.label}
          className="motion-safe:animate-[rise_520ms_ease_both] min-h-28 rounded-[14px] border border-gold-light/20 bg-gradient-to-b from-charcoal/95 to-charcoal/70 p-5"
        >
          <strong className="block font-[family-name:var(--font-body)] text-3xl font-semibold leading-none text-gold sm:text-4xl">
            {stat.value}
          </strong>
          <span className="mt-2 block text-xs font-bold text-gold-light">
            {stat.label}
          </span>
        </article>
      ))}
    </div>
  );
}
