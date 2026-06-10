import { mkdir, open, stat } from 'fs/promises';
import path from 'path';

export const MIME_TYPES: Record<string, string> = {
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

/** Root for persisted uploads (Coolify: mount volume at /app/public/uploads). */
export function getUploadsRoot(): string {
	const configured = process.env.UPLOAD_DIR?.trim();
	if (configured) {
		return path.resolve(configured);
	}
	return path.join(process.cwd(), 'public', 'uploads');
}

export function getNomineesUploadDir(): string {
	return path.join(getUploadsRoot(), 'nominees');
}

export function resolveUploadFilePath(slug: string[]): string | null {
	const uploadsRoot = getUploadsRoot();
	const filePath = path.join(uploadsRoot, ...slug);
	const normalizedRoot = path.resolve(uploadsRoot) + path.sep;
	if (!path.resolve(filePath).startsWith(normalizedRoot)) {
		return null;
	}
	return filePath;
}

export function buildLocalUploadUrl(filename: string): string {
	return `/api/upload/nominees/${filename}`;
}

export async function ensureNomineesUploadDir(): Promise<string> {
	const dir = getNomineesUploadDir();
	await mkdir(dir, { recursive: true });
	return dir;
}

function contentTypeForPath(filePath: string): string {
	const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
	return MIME_TYPES[ext] ?? 'application/octet-stream';
}

/** Serve a file from disk, with HTTP Range support for mobile video playback. */
export async function serveLocalUploadFile(
	filePath: string,
	rangeHeader: string | null,
): Promise<Response> {
	const fileStat = await stat(filePath);
	const fileSize = fileStat.size;
	const contentType = contentTypeForPath(filePath);

	if (!rangeHeader) {
		const fileHandle = await open(filePath, 'r');
		try {
			const buffer = Buffer.alloc(fileSize);
			await fileHandle.read(buffer, 0, fileSize, 0);
			return new Response(buffer, {
				headers: {
					'Content-Type': contentType,
					'Content-Length': String(fileSize),
					'Accept-Ranges': 'bytes',
					'Cache-Control': 'public, max-age=31536000, immutable',
				},
			});
		} finally {
			await fileHandle.close();
		}
	}

	const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader.trim());
	if (!match) {
		return new Response('Invalid Range', { status: 416 });
	}

	let start = match[1] ? Number.parseInt(match[1], 10) : 0;
	let end = match[2] ? Number.parseInt(match[2], 10) : fileSize - 1;

	if (
		Number.isNaN(start) ||
		Number.isNaN(end) ||
		start < 0 ||
		end >= fileSize ||
		start > end
	) {
		return new Response(null, {
			status: 416,
			headers: { 'Content-Range': `bytes */${fileSize}` },
		});
	}

	const chunkSize = end - start + 1;
	const fileHandle = await open(filePath, 'r');
	try {
		const buffer = Buffer.alloc(chunkSize);
		await fileHandle.read(buffer, 0, chunkSize, start);
		return new Response(buffer, {
			status: 206,
			headers: {
				'Content-Type': contentType,
				'Content-Length': String(chunkSize),
				'Content-Range': `bytes ${start}-${end}/${fileSize}`,
				'Accept-Ranges': 'bytes',
				'Cache-Control': 'public, max-age=31536000, immutable',
			},
		});
	} finally {
		await fileHandle.close();
	}
}
