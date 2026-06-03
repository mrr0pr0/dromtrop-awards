export const dynamic = 'force-dynamic';

import { listPendingUsers } from '@/lib/db/users';
import { UsersManager } from '@/components/admin/users-manager';

export default async function AdminUsersPage() {
	const pendingUsers = await listPendingUsers();

	return (
		<div>
			<h1 className="text-3xl font-semibold text-white">
				Brukere
			</h1>
			<p className="mt-1 text-sm text-gold-light">
				Godkjenn eller avvis brukere som venter på tilgang.
			</p>
			<div className="mt-6">
				<UsersManager pendingUsers={pendingUsers} />
			</div>
		</div>
	);
}
