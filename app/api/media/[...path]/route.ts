import type { Session } from 'next-auth';
import { auth } from '@/auth';
import { isAdmin, isApproved, isJuryPanel } from '@/lib/auth/permissions';
import {
	createB2PresignedGetUrl,
	isB2Configured,
} from '@/lib/uploads/b2-media';
import { MIME_TYPES } from '@/lib/uploads/local-storage';

export const dynamic = 'force-dynamic';

function canAccessMedia(session: Session | null): boolean {
	if (!session?.user) return false;
	return (
		isApproved(session) ||
		isAdmin(session) ||
		isJuryPanel(session)
	);
}

function contentTypeForKey(key: string): string {
	const ext = key.split('.').pop()?.toLowerCase() ?? '';
	return MIME_TYPES[ext] ?? 'application/octet-stream';
}

/** Stream private B2 objects through the app (works without a public bucket). */
export async function GET(
	req: Request,
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

	const signedUrl = createB2PresignedGetUrl(key, 3600);
	const rangeHeader = req.headers.get('range');
	const upstreamHeaders: HeadersInit = {};
	if (rangeHeader) {
		upstreamHeaders.Range = rangeHeader;
	}

	const upstream = await fetch(signedUrl, { headers: upstreamHeaders });
	if (!upstream.ok && upstream.status !== 206) {
		return Response.json(
			{ error: 'Could not load media from storage.' },
			{ status: upstream.status === 404 ? 404 : 502 },
		);
	}

	const headers = new Headers();
	const contentType =
		upstream.headers.get('content-type') ??
		contentTypeForKey(key);
	headers.set('Content-Type', contentType);
	headers.set('Accept-Ranges', 'bytes');
	headers.set('Cache-Control', 'private, max-age=3600');

	const contentLength = upstream.headers.get('content-length');
	if (contentLength) {
		headers.set('Content-Length', contentLength);
	}

	const contentRange = upstream.headers.get('content-range');
	if (contentRange) {
		headers.set('Content-Range', contentRange);
	}

	return new Response(upstream.body, {
		status: upstream.status,
		headers,
	});
}
