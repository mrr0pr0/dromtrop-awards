import { auth } from '@/auth';
import { castVote } from '@/lib/db/votes';
import { getNomineeById } from '@/lib/db/nominees';
import { canVote } from '@/lib/auth/permissions';
import { voteSchema } from '@/lib/validations/vote';
import { isUniqueViolation } from '@/lib/api/errors';

export async function POST(req: Request) {
	const session = await auth();

	if (!canVote(session)) {
		return Response.json(
			{ error: 'Du har ikke tilgang til å stemme.' },
			{ status: 401 },
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
		return Response.json(
			{ error: 'Ugyldig stemme.' },
			{ status: 400 },
		);
	}

	const { categoryId, nomineeId } = parsed.data;
	const nominee = await getNomineeById(nomineeId);

	if (
		!nominee ||
		nominee.category_id !== categoryId ||
		nominee.status !== 'approved'
	) {
		return Response.json(
			{ error: 'Nominert finnes ikke i denne kategorien.' },
			{ status: 400 },
		);
	}

	if (nominee.user_id === session!.user!.id) {
		return Response.json(
			{ error: 'Du kan ikke stemme på deg selv.' },
			{ status: 400 },
		);
	}

	try {
		const vote = await castVote({
			userId: session!.user!.id,
			categoryId,
			nomineeId,
		});
		return Response.json({ vote });
	} catch (err) {
		if (isUniqueViolation(err)) {
			return Response.json(
				{
					error:
						'Du har allerede stemt i denne kategorien.',
				},
				{ status: 409 },
			);
		}
		return Response.json(
			{ error: 'Kunne ikke registrere stemme.' },
			{ status: 500 },
		);
	}
}
