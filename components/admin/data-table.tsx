import { cn } from '@/lib/utils/cn';

interface Column<T> {
	key: string;
	header: string;
	render: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
	columns: Column<T>[];
	data: T[];
	emptyMessage?: string;
}

export function DataTable<
	T extends { id: number | string },
>({
	columns,
	data,
	emptyMessage = 'Ingen data',
}: DataTableProps<T>) {
	if (data.length === 0) {
		return (
			<p className="text-sm text-gold-light">
				{emptyMessage}
			</p>
		);
	}

	return (
		<div className="overflow-x-auto rounded-lg border border-gold/20">
			<table className="w-full text-left text-sm">
				<thead>
					<tr className="border-b border-gold/20 bg-charcoal">
						{columns.map((col) => (
							<th
								key={col.key}
								className="px-4 py-3 font-medium text-gold-light"
							>
								{col.header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{data.map((row) => (
						<tr
							key={row.id}
							className={cn(
								'border-b border-gold/10 transition-all duration-200 hover:bg-gold/5',
							)}
						>
							{columns.map((col) => (
								<td
									key={col.key}
									className="px-4 py-3 text-white"
								>
									{col.render(row)}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
