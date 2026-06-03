export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { isAdmin } from '@/lib/auth/permissions';
import { listUsers } from '@/lib/db/users';
import { RolesManager } from '@/components/admin/roles-manager';

export default async function AdminRolesPage() {
	const session = await auth();
	if (!isAdmin(session)) {
		redirect('/admin/users');
	}

	const users = await listUsers();

	return (
		<div>
			<h1 className="text-3xl font-semibold text-white">
				Brukerroller
			</h1>
			<p className="mt-1 text-sm text-gold-light">
				Kun administratorer kan endre roller.
			</p>
			<div className="mt-6">
				<RolesManager users={users} />
			</div>
		</div>
	);
}
