import { createHash, randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 700 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set([
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
]);

const ALLOWED_VIDEO_TYPES = new Set([
	'video/mp4',
	'video/webm',
	'video/ogg',
	'video/quicktime',
]);

function isVideo(file: File): boolean {
	return ALLOWED_VIDEO_TYPES.has(file.type);
}

function signCloudinaryParams(
	params: Record<string, string>,
	apiSecret: string,
): string {
	const sorted = Object.keys(params)
		.sort()
		.map((key) => `${key}=${params[key]}`)
		.join('&');
	return createHash('sha1')
		.update(sorted + apiSecret)
		.digest('hex');
}

function isCloudinaryConfigured(): boolean {
	return !!(
		process.env.CLOUDINARY_CLOUD_NAME &&
		process.env.CLOUDINARY_API_KEY &&
		process.env.CLOUDINARY_API_SECRET
	);
}

function getFileExtension(file: File): string {
	const fromName = file.name.split('.').pop()?.toLowerCase();
	const allExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'ogg', 'mov'];
	if (fromName && allExts.includes(fromName)) {
		return fromName === 'jpeg' ? 'jpg' : fromName;
	}

	const mimeMap: Record<string, string> = {
		'image/jpeg': 'jpg',
		'image/png': 'png',
		'image/webp': 'webp',
		'image/gif': 'gif',
		'video/mp4': 'mp4',
		'video/webm': 'webm',
		'video/ogg': 'ogg',
		'video/quicktime': 'mov',
	};
	return mimeMap[file.type] ?? 'bin';
}

async function uploadToCloudinary(file: File): Promise<string> {
	const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
	const apiKey = process.env.CLOUDINARY_API_KEY!;
	const apiSecret = process.env.CLOUDINARY_API_SECRET!;
	const timestamp = Math.round(Date.now() / 1000).toString();
	const folder = 'nominees';
	const params = { folder, timestamp };
	const signature = signCloudinaryParams(params, apiSecret);
	const resourceType = isVideo(file) ? 'video' : 'image';

	const formData = new FormData();
	formData.append('file', file);
	formData.append('api_key', apiKey);
	formData.append('timestamp', timestamp);
	formData.append('signature', signature);
	formData.append('folder', folder);

	const res = await fetch(
		`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
		{ method: 'POST', body: formData },
	);

	const text = await res.text();
	let data: { secure_url?: string; error?: { message?: string } };
	try {
		data = JSON.parse(text);
	} catch {
		if (resourceType === 'video') {
			return uploadToLocal(file);
		}
		throw new Error('Cloudinary svarte med en ugyldig respons.');
	}

	if (!res.ok || !data.secure_url) {
		if (resourceType === 'video') {
			return uploadToLocal(file);
		}
		throw new Error(
			data.error?.message ?? 'Kunne ikke laste opp til Cloudinary.',
		);
	}

	return data.secure_url;
}

async function uploadToLocal(file: File): Promise<string> {
	const ext = getFileExtension(file);
	const filename = `${randomUUID()}.${ext}`;
	const dir = path.join(process.cwd(), 'public', 'uploads', 'nominees');
	await mkdir(dir, { recursive: true });
	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(path.join(dir, filename), buffer);
	return `/uploads/nominees/${filename}`;
}

export function validateNomineeFile(file: File): string | null {
	if (ALLOWED_IMAGE_TYPES.has(file.type)) {
		if (file.size > MAX_IMAGE_SIZE) {
			return 'Bildet kan ikke være større enn 5 MB.';
		}
		return null;
	}
	if (ALLOWED_VIDEO_TYPES.has(file.type)) {
		if (file.size > MAX_VIDEO_SIZE) {
			return 'Videoen kan ikke være større enn 700 MB.';
		}
		return null;
	}
	return 'Kun JPG, PNG, WebP, GIF, MP4, WebM og MOV er tillatt.';
}

/** @deprecated Use validateNomineeFile instead */
export function validateNomineeImageFile(file: File): string | null {
	return validateNomineeFile(file);
}

export async function uploadNomineeImage(file: File): Promise<string> {
	const validationError = validateNomineeFile(file);
	if (validationError) {
		throw new Error(validationError);
	}

	if (isCloudinaryConfigured()) {
		return uploadToCloudinary(file);
	}

	return uploadToLocal(file);
}