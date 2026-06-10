import { auth } from '@/auth';
import { isAdmin, isApproved, isJuryPanel } from '@/lib/auth/permissions';
import {
	createB2PresignedGetUrl,
	isB2Configured,
} from '@/lib/uploads/b2-media';

export const dynamic = 'force-dynamic';

function canAccessMedia(session: Awaited<ReturnType<typeof auth>>): boolean {
	if (!session?.user) return false;
	return (
		isApproved(session) ||
		isAdmin(session) ||
		isJuryPanel(session)
	);
}

export async function GET(
	_req: Request,
	{ params }: { params: Promise<{ path: string[] }> },
) {
	if (!isB2Configured()) {
		return Response.json(
			{ error: 'B2 is not configured.' },
			{ status: 503 },
		);
	}

	const session = await auth();
	if (!canAccessMedia(session)) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const segments = (await params).path;
	const key = segments.map((part) => decodeURIComponent(part)).join('/');

	if (!key.startsWith('nominees/') || key.includes('..')) {
		return Response.json({ error: 'Invalid media path.' }, { status: 400 });
	}

	const signedUrl = createB2PresignedGetUrl(key);
	return Response.redirect(signedUrl, 307);
}
