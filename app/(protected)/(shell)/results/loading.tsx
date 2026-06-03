export default function ResultsLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="h-10 w-48 rounded-lg bg-charcoal" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg bg-charcoal" />
        ))}
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="space-y-3">
          <div className="h-6 w-56 rounded bg-charcoal" />
          <div className="h-16 rounded-lg bg-charcoal" />
          <div className="h-16 rounded-lg bg-charcoal" />
        </div>
      ))}
    </div>
  );
}
