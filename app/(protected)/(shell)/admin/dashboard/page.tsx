export const dynamic = 'force-dynamic';

import {
	countTotalVotes,
	getRecentVotes,
} from '@/lib/db/votes';
import {
	countApprovedUsers,
	countPendingUsers,
	getRecentUsers,
} from '@/lib/db/users';
import { countActiveCategories } from '@/lib/db/categories';
import { countTotalJuryVotes } from '@/lib/db/jury-votes';
import { StatCard } from '@/components/admin/stat-card';
import { Card } from '@/components/ui/card';

export default async function AdminDashboardPage() {
	const [
		totalVotes,
		juryVotes,
		activeCategories,
		approvedUsers,
		pendingUsers,
		recentVotes,
		recentUsers,
	] = await Promise.all([
		countTotalVotes(),
		countTotalJuryVotes(),
		countActiveCategories(),
		countApprovedUsers(),
		countPendingUsers(),
		getRecentVotes(8),
		getRecentUsers(5),
	]);

	return (
		<div>
			<h1 className="text-3xl font-semibold text-white">
				Oversikt
			</h1>
			<p className="mt-1 text-sm text-gold-light">
				Admin-dashbord for Drømtorp Awards 2026
			</p>

			<div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
				<StatCard
					label="Totalt stemmer"
					value={totalVotes}
				/>
				<StatCard
					label="Jury-stemmer"
					value={juryVotes}
				/>
				<StatCard
					label="Aktive kategorier"
					value={activeCategories}
				/>
				<StatCard
					label="Godkjente brukere"
					value={approvedUsers}
				/>
				<StatCard
					label="Ventende brukere"
					value={pendingUsers}
				/>
			</div>

			<div className="mt-8 grid gap-6 lg:grid-cols-2">
				<Card>
					<h2 className="mb-4 text-lg font-medium text-white">
						Siste stemmer
					</h2>
					{recentVotes.length === 0 ? (
						<p className="text-sm text-gold-light">
							Ingen stemmer ennå.
						</p>
					) : (
						<ul className="space-y-2 text-sm">
							{recentVotes.map((v) => (
								<li key={v.id} className="text-gold-light">
									<span className="text-white">
										{v.user_email}
									</span>{' '}
									stemte på{' '}
									<span className="text-gold">
										{v.nominee_name}
									</span>{' '}
									({v.category_name})
								</li>
							))}
						</ul>
					)}
				</Card>
				<Card>
					<h2 className="mb-4 text-lg font-medium text-white">
						Nye brukere
					</h2>
					{recentUsers.length === 0 ? (
						<p className="text-sm text-gold-light">
							Ingen brukere ennå.
						</p>
					) : (
						<ul className="space-y-2 text-sm">
							{recentUsers.map((u) => (
								<li key={u.id} className="text-gold-light">
									<span className="text-white">
										{u.email}
									</span>{' '}
									— {u.status}
								</li>
							))}
						</ul>
					)}
				</Card>
			</div>
		</div>
	);
}
