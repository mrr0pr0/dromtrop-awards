export const dynamic = 'force-dynamic';

import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getCategoryById } from '@/lib/db/categories';
import {
	getNomineeById,
	listNomineesByCategory,
} from '@/lib/db/nominees';
import { getUserVotes } from '@/lib/db/votes';
import { NomineeDetailClient } from '@/components/voting/nominee-detail-client';

interface NomineeDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function NomineeDetailPage({
	params,
}: NomineeDetailPageProps) {
	const { id } = await params;
	const nomineeId = Number(id);
	if (!Number.isFinite(nomineeId) || nomineeId <= 0)
		notFound();

	const nominee = await getNomineeById(nomineeId);
	if (!nominee || nominee.status !== 'approved') notFound();

	const [category, session] = await Promise.all([
		getCategoryById(nominee.category_id),
		auth(),
	]);
	if (!category) notFound();

	const [categoryNominees, userVotes] = await Promise.all([
		listNomineesByCategory(category.id),
		session?.user?.id
			? getUserVotes(session.user.id)
			: Promise.resolve([]),
	]);

	const votingOpen = process.env.VOTING_OPEN === 'true';

	return (
		<NomineeDetailClient
			nominee={nominee}
			category={category}
			userVotes={userVotes}
			currentUserId={session?.user?.id}
			nomineeCountInCategory={categoryNominees.length}
			votingOpen={votingOpen}
		/>
	);
}
