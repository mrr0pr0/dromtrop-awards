export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { listCategories } from '@/lib/db/categories';
import { listNomineesByCategory } from '@/lib/db/nominees';
import { getUserVotes } from '@/lib/db/votes';
import { VoteDashboard } from '@/components/voting/vote-dashboard';

export default async function VotePage() {
	const session = await auth();
	const categories = await listCategories(true);

	const categoriesWithNominees = await Promise.all(
		categories.map(async (category) => ({
			category,
			nominees: await listNomineesByCategory(category.id),
		})),
	);

	const nominees: Record<
		number,
		(typeof categoriesWithNominees)[0]['nominees']
	> = {};
	for (const {
		category,
		nominees: categoryNominees,
	} of categoriesWithNominees) {
		nominees[category.id] = categoryNominees;
	}

	const userVotes = session?.user?.id
		? await getUserVotes(session.user.id)
		: [];

	return (
		<VoteDashboard
			categories={categories}
			nominees={nominees}
			userVotes={userVotes}
			currentUserId={session?.user?.id}
		/>
	);
}
