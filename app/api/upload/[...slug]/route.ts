import { readFile } from 'fs/promises';
import path from 'path';
import { NextRequest } from 'next/server';

const MIME_TYPES: Record<string, string> = {
	mp4: 'video/mp4',
	webm: 'video/webm',
	ogg: 'video/ogg',
	mov: 'video/quicktime',
	jpg: 'image/jpeg',
	jpeg: 'image/jpeg',
	png: 'image/png',
	webp: 'image/webp',
	gif: 'image/gif',
};

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ slug: string[] }> },
) {
	const { slug } = await params;

	const filePath = path.join(
		process.cwd(),
		'public',
		'uploads',
		...slug,
	);

	// Prevent path traversal
	const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
	if (!filePath.startsWith(uploadsDir)) {
		return new Response('Forbidden', { status: 403 });
	}

	try {
		const buffer = await readFile(filePath);
		const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
		const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

		return new Response(buffer, {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': 'public, max-age=31536000, immutable',
			},
		});
	} catch {
		return new Response('Not found', { status: 404 });
	}
}