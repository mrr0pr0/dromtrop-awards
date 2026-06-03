export default function VoteLoading() {
	return (
		<div className="animate-pulse space-y-8">
			<div className="h-10 w-48 rounded-lg bg-charcoal" />
			<div className="h-4 w-72 rounded bg-charcoal" />
			{[1, 2].map((i) => (
				<div key={i} className="space-y-4">
					<div className="h-6 w-64 rounded bg-charcoal" />
					<div className="grid gap-4 sm:grid-cols-3">
						{[1, 2, 3].map((j) => (
							<div
								key={j}
								className="h-40 rounded-lg bg-charcoal"
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
}
