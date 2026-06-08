export const dynamic = 'force-dynamic';

import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { isJuryPanel } from '@/lib/auth/permissions';
import {
	getAllTop3,
	getMyJuryVotes,
} from '@/lib/db/jury-votes';
import { JuryDashboard } from '@/components/jury/jury-dashboard';

export default async function JuryPage() {
	const session = await auth();
	if (!isJuryPanel(session)) redirect('/vote');

	const [categories, myVotes] = await Promise.all([
		getAllTop3(),
		getMyJuryVotes(session!.user!.id),
	]);

	const votingOpen = process.env.JURY_VOTING_OPEN === 'true';

	return (
		<JuryDashboard
			categories={categories}
			myVotes={myVotes}
			votingOpen={votingOpen}
		/>
	);
}
