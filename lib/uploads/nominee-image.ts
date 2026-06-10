import { createHash, randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
]);

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
	if (fromName && ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fromName)) {
		return fromName === 'jpeg' ? 'jpg' : fromName;
	}

	const mimeMap: Record<string, string> = {
		'image/jpeg': 'jpg',
		'image/png': 'png',
		'image/webp': 'webp',
		'image/gif': 'gif',
	};
	return mimeMap[file.type] ?? 'jpg';
}

async function uploadToCloudinary(file: File): Promise<string> {
	const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
	const apiKey = process.env.CLOUDINARY_API_KEY!;
	const apiSecret = process.env.CLOUDINARY_API_SECRET!;
	const timestamp = Math.round(Date.now() / 1000).toString();
	const folder = 'nominees';
	const params = { folder, timestamp };
	const signature = signCloudinaryParams(params, apiSecret);

	const formData = new FormData();
	formData.append('file', file);
	formData.append('api_key', apiKey);
	formData.append('timestamp', timestamp);
	formData.append('signature', signature);
	formData.append('folder', folder);

	const res = await fetch(
		`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
		{ method: 'POST', body: formData },
	);

	const data = (await res.json()) as {
		secure_url?: string;
		error?: { message?: string };
	};

	if (!res.ok || !data.secure_url) {
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

export function validateNomineeImageFile(file: File): string | null {
	if (!ALLOWED_TYPES.has(file.type)) {
		return 'Kun JPG, PNG, WebP og GIF er tillatt.';
	}
	if (file.size > MAX_FILE_SIZE) {
		return 'Bildet kan ikke være større enn 5 MB.';
	}
	return null;
}

export async function uploadNomineeImage(file: File): Promise<string> {
	const validationError = validateNomineeImageFile(file);
	if (validationError) {
		throw new Error(validationError);
	}

	if (isCloudinaryConfigured()) {
		return uploadToCloudinary(file);
	}

	return uploadToLocal(file);
}
