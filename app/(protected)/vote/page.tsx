export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { listCategories } from '@/lib/db/categories';
import { listApprovedNomineesGrouped } from '@/lib/db/nominees';
import { getUserVotes } from '@/lib/db/votes';
import { VoteDashboard } from '@/components/voting/vote-dashboard';

export default async function VotePage() {
	const session = await auth();
	const categories = await listCategories(true);

	const categoryIds = categories.map((c) => c.id);
	const [nominees, userVotes] = await Promise.all([
		listApprovedNomineesGrouped(categoryIds),
		session?.user?.id
			? getUserVotes(session.user.id)
			: Promise.resolve([]),
	]);

	return (
		<VoteDashboard
			categories={categories}
			nominees={nominees}
			userVotes={userVotes}
			currentUserId={session?.user?.id}
		/>
	);
}
