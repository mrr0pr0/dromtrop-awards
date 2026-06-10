import { auth } from '@/auth';
import {
	canVote,
	isAdmin,
	isNominationsOpen,
} from '@/lib/auth/permissions';
import { uploadNomineeImage } from '@/lib/uploads/nominee-image';

export async function POST(req: Request) {
	const session = await auth();
	const canManageNominees = isAdmin(session);

	if (!canManageNominees && !canVote(session)) {
		return Response.json(
			{ error: 'Unauthorized' },
			{ status: 401 },
		);
	}

	if (!canManageNominees && !isNominationsOpen()) {
		return Response.json(
			{ error: 'Nominasjoner er stengt.' },
			{ status: 403 },
		);
	}

	let formData: FormData;
	try {
		formData = await req.formData();
	} catch {
		return Response.json(
			{ error: 'Ugyldig opplastingsforespørsel.' },
			{ status: 400 },
		);
	}

	const file = formData.get('file');
	if (!(file instanceof File) || file.size === 0) {
		return Response.json(
			{ error: 'Velg et bilde å laste opp.' },
			{ status: 400 },
		);
	}

	try {
		const url = await uploadNomineeImage(file);
		return Response.json({ url });
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: 'Kunne ikke laste opp bildet.';
		return Response.json({ error: message }, { status: 400 });
	}
}
