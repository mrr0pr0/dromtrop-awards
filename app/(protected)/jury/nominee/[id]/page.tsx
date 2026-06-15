export const dynamic = 'force-dynamic';

import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { isJuryPanel } from '@/lib/auth/permissions';
import { getCategoryById } from '@/lib/db/categories';
import {
	getNomineeById,
	listNomineesByCategory,
} from '@/lib/db/nominees';
import { getMyJuryVotes } from '@/lib/db/jury-votes';
import { JuryNomineeDetailClient } from '@/components/jury/jury-nominee-detail-client';

interface JuryNomineeDetailPageProps {
	params: Promise<{ id: string }>;
}

export default async function JuryNomineeDetailPage({
	params,
}: JuryNomineeDetailPageProps) {
	const session = await auth();
	if (!isJuryPanel(session)) redirect('/vote');

	const { id } = await params;
	const nomineeId = Number(id);
	if (!Number.isFinite(nomineeId) || nomineeId <= 0)
		notFound();

	const nominee = await getNomineeById(nomineeId);
	if (!nominee || nominee.status !== 'approved') notFound();

	const [category, myVotes] = await Promise.all([
		getCategoryById(nominee.category_id),
		getMyJuryVotes(session!.user!.id),
	]);
	if (!category) notFound();

	const categoryNominees = await listNomineesByCategory(category.id);

	const votingOpen = process.env.JURY_VOTING_OPEN === 'true';

	return (
		<JuryNomineeDetailClient
			nominee={nominee}
			category={category}
			myVotes={myVotes}
			nomineeCountInCategory={categoryNominees.length}
			votingOpen={votingOpen}
		/>
	);
}