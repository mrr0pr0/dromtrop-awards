import { auth } from '@/auth';
import { isJury } from '@/lib/auth/permissions';
import { getMyJuryVotes } from '@/lib/db/jury-votes';

export async function GET() {
	const session = await auth();

	if (!isJury(session)) {
		return Response.json({ error: 'Ingen tilgang.' }, { status: 403 });
	}

	const votes = await getMyJuryVotes(session!.user!.id);
	return Response.json({ votes });
}
