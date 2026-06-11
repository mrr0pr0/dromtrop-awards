import { writeFile } from 'fs/promises';
import { createHash, randomUUID } from 'crypto';
import {
	buildLocalUploadUrl,
	ensureNomineesUploadDir,
} from '@/lib/uploads/local-storage';
import {
	buildStoredMediaUrl,
	getUploadStorage,
	uploadToS3,
} from '@/lib/uploads/s3-media';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 700 * 1024 * 1024;
const MAX_FILE_SIZE = 500 * 1024 * 1024;

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

const ALLOWED_FILE_TYPES = new Set([
	'application/zip',
	'application/x-zip-compressed',
	'application/x-zip',
	'application/octet-stream',
	'application/x-msdownload',
	'application/x-dosexec',
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

function getFileExtension(file: File): string {
	const fromName = file.name.split('.').pop()?.toLowerCase();
	const allExts = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'mp4', 'webm', 'ogg', 'mov', 'zip', 'exe'];
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
		'application/zip': 'zip',
		'application/x-zip-compressed': 'zip',
		'application/x-zip': 'zip',
		'application/x-msdownload': 'exe',
		'application/x-dosexec': 'exe',
		'application/octet-stream': fromName ?? 'bin',
	};
	return mimeMap[file.type] ?? 'bin';
}

async function uploadToObjectStorage(file: File): Promise<string> {
	const ext = getFileExtension(file);
	const key = `nominees/${randomUUID()}.${ext}`;
	await uploadToS3(file, key);
	return buildStoredMediaUrl(key);
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
		throw new Error('Cloudinary svarte med en ugyldig respons.');
	}

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
	const dir = await ensureNomineesUploadDir();
	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(`${dir}/${filename}`, buffer);
	return buildLocalUploadUrl(filename);
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
	// Allow zip/exe by extension as a fallback since browsers report octet-stream
	const ext = file.name.split('.').pop()?.toLowerCase();
	const isZipOrExe = ext === 'zip' || ext === 'exe';
	if (ALLOWED_FILE_TYPES.has(file.type) || isZipOrExe) {
		if (file.size > MAX_FILE_SIZE) {
			return 'Filen kan ikke være større enn 500 MB.';
		}
		return null;
	}
	return 'Kun JPG, PNG, WebP, GIF, MP4, WebM, MOV, ZIP og EXE er tillatt.';
}

export function validateNomineeDownloadFile(file: File): string | null {
	const ext = file.name.split('.').pop()?.toLowerCase();
	const isZipOrExe = ext === 'zip' || ext === 'exe';
	if (!isZipOrExe && !ALLOWED_FILE_TYPES.has(file.type)) {
		return 'Kun ZIP og EXE filer er tillatt for nedlasting.';
	}
	if (file.size > MAX_FILE_SIZE) {
		return 'Filen kan ikke være større enn 500 MB.';
	}
	return null;
}

/** @deprecated Use validateNomineeFile instead */
export function validateNomineeImageFile(file: File): string | null {
	return validateNomineeFile(file);
}

export async function uploadNomineeImage(file: File): Promise<string> {
	const storage = getUploadStorage();
	console.error('[nominee-upload] file:', {
		type: file.type,
		size: file.size,
		name: file.name,
		storage,
	});

	const validationError = validateNomineeFile(file);
	if (validationError) {
		console.error('[nominee-upload] validation failed:', validationError);
		throw new Error(validationError);
	}

	switch (storage) {
		case 's3':
			return uploadToObjectStorage(file);
		case 'cloudinary':
			return uploadToCloudinary(file);
		default:
			return uploadToLocal(file);
	}
}

export async function uploadNomineeDownloadFile(file: File): Promise<string> {
	const storage = getUploadStorage();
	console.error('[nominee-file-upload] file:', {
		type: file.type,
		size: file.size,
		name: file.name,
		storage,
	});

	const validationError = validateNomineeDownloadFile(file);
	if (validationError) {
		console.error('[nominee-file-upload] validation failed:', validationError);
		throw new Error(validationError);
	}

	const ext = getFileExtension(file);
	const safeName = file.name
		.replace(/[^a-zA-Z0-9._-]/g, '_')
		.replace(/_{2,}/g, '_')
		.slice(0, 80);
	const key = `nominees/files/${randomUUID()}-${safeName}.${ext}`;

	switch (storage) {
		case 's3': {
			await uploadToS3(file, key);
			return buildStoredMediaUrl(key);
		}
		default: {
			// local fallback
			const { writeFile } = await import('fs/promises');
			const { ensureNomineesUploadDir } = await import('./local-storage');
			const filename = `${randomUUID()}-${safeName}.${ext}`;
			const dir = await ensureNomineesUploadDir();
			const buffer = Buffer.from(await file.arrayBuffer());
			await writeFile(`${dir}/${filename}`, buffer);
			const { buildLocalUploadUrl } = await import('./local-storage');
			return buildLocalUploadUrl(filename);
		}
	}
}