import { NextRequest } from 'next/server';
import {
	resolveUploadFilePath,
	serveLocalUploadFile,
} from '@/lib/uploads/local-storage';

export const dynamic = 'force-dynamic';

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ slug: string[] }> },
) {
	const { slug } = await params;
	const filePath = resolveUploadFilePath(slug);

	if (!filePath) {
		return new Response('Forbidden', { status: 403 });
	}

	try {
		return await serveLocalUploadFile(
			filePath,
			req.headers.get('range'),
		);
	} catch {
		return new Response('Not found', { status: 404 });
	}
}
