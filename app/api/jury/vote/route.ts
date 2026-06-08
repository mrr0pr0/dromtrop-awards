import { auth } from '@/auth';
import { canJuryVote, isJury } from '@/lib/auth/permissions';
import {
	castJuryVote,
	getTop3ForCategory,
} from '@/lib/db/jury-votes';
import { isUniqueViolation } from '@/lib/api/errors';
import { voteSchema } from '@/lib/validations/vote';

export async function POST(req: Request) {
	const session = await auth();

	if (!isJury(session)) {
		return Response.json({ error: 'Ingen tilgang.' }, { status: 403 });
	}

	if (!canJuryVote(session)) {
		return Response.json(
			{ error: 'Jury-avstemning er ikke åpen.' },
			{ status: 403 },
		);
	}

	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return Response.json(
			{ error: 'Ugyldig forespørsel.' },
			{ status: 400 },
		);
	}

	const parsed = voteSchema.safeParse(body);
	if (!parsed.success) {
		return Response.json({ error: 'Ugyldig stemme.' }, { status: 400 });
	}

	const { categoryId, nomineeId } = parsed.data;

	const top3 = await getTop3ForCategory(categoryId);
	const isEligible = top3.some((n) => n.id === nomineeId);
	if (!isEligible) {
		return Response.json(
			{
				error:
					'Denne nominerte er ikke i topp 3 for denne kategorien.',
			},
			{ status: 400 },
		);
	}

	try {
		const vote = await castJuryVote({
			userId: session!.user!.id,
			categoryId,
			nomineeId,
		});
		return Response.json({ vote });
	} catch (err) {
		if (isUniqueViolation(err)) {
			return Response.json(
				{ error: 'Du har allerede stemt i denne kategorien.' },
				{ status: 409 },
			);
		}
		return Response.json(
			{ error: 'Kunne ikke registrere stemme.' },
			{ status: 500 },
		);
	}
}
