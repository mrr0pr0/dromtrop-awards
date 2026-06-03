import { Card } from "@/components/ui/card";

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
    <div className="mb-8 grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} className="text-center">
          <p className="text-3xl font-semibold text-gold">{stat.value}</p>
          <p className="mt-1 text-xs text-gold-light">{stat.label}</p>
        </Card>
      ))}
    </div>
  );
}
