import { auth } from '@/auth';
import {
	canVote,
	isAdmin,
	isNominationsOpen,
} from '@/lib/auth/permissions';
import { uploadNomineeDownloadFile } from '@/lib/uploads/nominee-image';

export const maxDuration = 120;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

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
	} catch (err) {
		console.error('[upload/file] formData parse failed:', err);
		return Response.json(
			{ error: 'Ugyldig opplastingsforespørsel.' },
			{ status: 400 },
		);
	}

	const file = formData.get('file');
	if (!(file instanceof File) || file.size === 0) {
		return Response.json(
			{ error: 'Velg en fil å laste opp.' },
			{ status: 400 },
		);
	}

	try {
		const url = await uploadNomineeDownloadFile(file);
		const fileName = file.name;
		return Response.json({ url, fileName });
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: 'Kunne ikke laste opp filen.';
		console.error('[upload/file] upload failed:', message);
		return Response.json({ error: message }, { status: 400 });
	}
}
