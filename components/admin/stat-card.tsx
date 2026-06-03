import { Card } from "@/components/ui/card";

interface StatCardProps {
  label: string;
  value: number | string;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Card>
      <p className="text-3xl font-semibold text-gold">{value}</p>
      <p className="mt-1 text-xs text-gold-light">{label}</p>
    </Card>
  );
}
