import { createHash, randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import {
	buildStoredMediaUrl,
	getUploadStorage,
	normalizeB2Endpoint,
} from '@/lib/uploads/b2-media';

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

async function uploadToB2(file: File): Promise<string> {
	// B2 S3-compatible API
	// B2_ENDPOINT format: https://<accountId>.s3.<region>.backblazeb2.com
	// or the shorter: https://s3.<region>.backblazeb2.com
	const endpoint = normalizeB2Endpoint(process.env.B2_ENDPOINT!);
	const bucket = process.env.B2_BUCKET!.trim();
	const keyId = process.env.B2_KEY_ID!.trim();
	const appKey = process.env.B2_APPLICATION_KEY!.trim();

	const ext = getFileExtension(file);
	const key = `nominees/${randomUUID()}.${ext}`;
	const buffer = Buffer.from(await file.arrayBuffer());

	// Build the upload URL
	const url = `${endpoint}/${bucket}/${key}`;

	// AWS Signature V4 — manual implementation to avoid needing @aws-sdk
	const now = new Date();
	const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
	const amzDate = now.toISOString().replace(/[:-]/g, '').slice(0, 15) + 'Z';

	// Extract region from endpoint, e.g. "us-west-004" from "s3.us-west-004.backblazeb2.com"
	const regionMatch = endpoint.match(/s3\.([^.]+)\.backblazeb2\.com/);
	const region = regionMatch ? regionMatch[1] : 'us-east-005';

	const payloadHash = createHash('sha256').update(buffer).digest('hex');
	const host = new URL(endpoint).host;

	const canonicalHeaders =
		`content-type:${file.type}\n` +
		`host:${host}\n` +
		`x-amz-content-sha256:${payloadHash}\n` +
		`x-amz-date:${amzDate}\n`;

	const signedHeaders = 'content-type;host;x-amz-content-sha256;x-amz-date';

	const canonicalRequest = [
		'PUT',
		`/${bucket}/${key}`,
		'',
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	].join('\n');

	const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
	const stringToSign = [
		'AWS4-HMAC-SHA256',
		amzDate,
		credentialScope,
		createHash('sha256').update(canonicalRequest).digest('hex'),
	].join('\n');

	function hmac(key: Buffer | string, data: string): Buffer {
		const { createHmac } = require('crypto');
		return createHmac('sha256', key).update(data).digest();
	}

	const signingKey = hmac(
		hmac(
			hmac(
				hmac(Buffer.from('AWS4' + appKey), dateStamp),
				region,
			),
			's3',
		),
		'aws4_request',
	);
	const signature = hmac(signingKey, stringToSign).toString('hex');

	const authorization =
		`AWS4-HMAC-SHA256 Credential=${keyId}/${credentialScope}, ` +
		`SignedHeaders=${signedHeaders}, Signature=${signature}`;

	const res = await fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': file.type,
			'x-amz-content-sha256': payloadHash,
			'x-amz-date': amzDate,
			Authorization: authorization,
		},
		body: buffer,
	});

	if (!res.ok) {
		const text = await res.text();
		if (
			res.status === 403 &&
			text.includes('Malformed Access Key Id')
		) {
			throw new Error(
				'B2 S3-API støtter ikke Master Application Key. Opprett en vanlig Application Key i Backblaze (App Keys → Add a New Application Key) med tilgang til bucketen, og oppdater B2_KEY_ID og B2_APPLICATION_KEY.',
			);
		}
		throw new Error(`B2 upload feilet: ${res.status} ${text}`);
	}

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
	const dir = path.join(process.cwd(), 'public', 'uploads', 'nominees');
	await mkdir(dir, { recursive: true });
	const buffer = Buffer.from(await file.arrayBuffer());
	await writeFile(path.join(dir, filename), buffer);
	return `/api/upload/nominees/${filename}`;
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

	switch (getUploadStorage()) {
		case 'b2':
			return uploadToB2(file);
		case 'cloudinary':
			return uploadToCloudinary(file);
		default:
			return uploadToLocal(file);
	}
}