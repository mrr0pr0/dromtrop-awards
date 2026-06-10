import { createHash, createHmac } from 'crypto';

export type UploadStorage = 'local' | 'b2' | 'cloudinary';

export function getUploadStorage(): UploadStorage {
	const mode = process.env.UPLOAD_STORAGE?.trim().toLowerCase();
	if (mode === 'local' || mode === 'b2' || mode === 'cloudinary') {
		return mode;
	}
	if (isB2Configured()) return 'b2';
	if (isCloudinaryConfigured()) return 'cloudinary';
	return 'local';
}

export function isCloudinaryConfigured(): boolean {
	return !!(
		process.env.CLOUDINARY_CLOUD_NAME &&
		process.env.CLOUDINARY_API_KEY &&
		process.env.CLOUDINARY_API_SECRET
	);
}

export function isLocalUploadUrl(url: string): boolean {
	return (
		url.startsWith('/api/upload/') ||
		url.startsWith('/uploads/')
	);
}

export function isB2Configured(): boolean {
	return !!(
		process.env.B2_ENDPOINT &&
		process.env.B2_BUCKET &&
		process.env.B2_KEY_ID &&
		process.env.B2_APPLICATION_KEY
	);
}

export function normalizeB2Endpoint(raw: string): string {
	const endpoint = raw.trim().replace(/\/$/, '');
	if (/^https?:\/\//i.test(endpoint)) {
		return endpoint;
	}
	return `https://${endpoint}`;
}

function getB2Region(endpoint: string): string {
	const regionMatch = endpoint.match(/s3\.([^.]+)\.backblazeb2\.com/);
	return regionMatch ? regionMatch[1] : 'us-east-005';
}

function uriEncode(value: string, encodeSlash = false): string {
	return value
		.split('')
		.map((ch) => {
			if (
				(ch >= 'A' && ch <= 'Z') ||
				(ch >= 'a' && ch <= 'z') ||
				(ch >= '0' && ch <= '9') ||
				ch === '_' ||
				ch === '-' ||
				ch === '~' ||
				ch === '.'
			) {
				return ch;
			}
			if (ch === '/' && !encodeSlash) return ch;
			return `%${ch.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')}`;
		})
		.join('');
}

function hmac(key: Buffer | string, data: string): Buffer {
	return createHmac('sha256', key).update(data).digest();
}

function signingKey(
	secret: string,
	dateStamp: string,
	region: string,
): Buffer {
	return hmac(
		hmac(hmac(hmac(`AWS4${secret}`, dateStamp), region), 's3'),
		'aws4_request',
	);
}

export function parseB2ObjectKey(url: string): string | null {
	try {
		const parsed = new URL(url);
		if (!parsed.hostname.includes('backblazeb2.com')) {
			return null;
		}

		const friendlyMatch = parsed.pathname.match(/^\/file\/[^/]+\/(.+)$/);
		if (friendlyMatch) {
			return decodeURIComponent(friendlyMatch[1]);
		}

		if (parsed.hostname.startsWith('s3.')) {
			const pathMatch = parsed.pathname.match(/^\/[^/]+\/(.+)$/);
			return pathMatch ? decodeURIComponent(pathMatch[1]) : null;
		}

		if (parsed.hostname.includes('.s3.')) {
			const key = parsed.pathname.replace(/^\//, '');
			return key ? decodeURIComponent(key) : null;
		}

		return null;
	} catch {
		return null;
	}
}

export function isB2StorageUrl(url: string): boolean {
	return parseB2ObjectKey(url) !== null;
}

/** Map stored media URLs to browser-ready same-origin paths. */
export function resolveMediaUrl(
	url: string | null | undefined,
): string | null {
	if (!url) return null;

	// Private B2 objects always go through the app proxy.
	const b2Key = parseB2ObjectKey(url);
	if (b2Key?.startsWith('nominees/')) {
		if (
			typeof window === 'undefined' &&
			process.env.B2_PUBLIC_BUCKET === 'true'
		) {
			return buildB2PublicObjectUrl(b2Key);
		}
		return `/api/media/${b2Key}`;
	}

	if (
		url.startsWith('/api/media/') ||
		url.startsWith('/api/upload/') ||
		url.startsWith('/uploads/')
	) {
		return url;
	}

	if (/^https?:\/\//i.test(url)) {
		if (
			typeof window !== 'undefined' &&
			window.location.protocol === 'https:' &&
			url.startsWith('http://')
		) {
			return `https://${url.slice('http://'.length)}`;
		}
		return url;
	}

	return url;
}

export function buildB2PublicObjectUrl(key: string): string {
	const endpoint = normalizeB2Endpoint(process.env.B2_ENDPOINT!);
	const bucket = process.env.B2_BUCKET!.trim();
	const publicUrl = process.env.B2_PUBLIC_URL?.trim();

	if (publicUrl) {
		return `${publicUrl.replace(/\/$/, '')}/${key}`;
	}

	const region = getB2Region(endpoint);
	return `https://${bucket}.s3.${region}.backblazeb2.com/${key}`;
}

export function buildStoredMediaUrl(key: string): string {
	if (process.env.B2_PUBLIC_BUCKET === 'true') {
		return buildB2PublicObjectUrl(key);
	}
	return `/api/media/${key}`;
}

export function createB2PresignedGetUrl(
	objectKey: string,
	expiresIn = 3600,
): string {
	const endpoint = normalizeB2Endpoint(process.env.B2_ENDPOINT!);
	const bucket = process.env.B2_BUCKET!.trim();
	const keyId = process.env.B2_KEY_ID!.trim();
	const appKey = process.env.B2_APPLICATION_KEY!.trim();
	const region = getB2Region(endpoint);
	const host = new URL(endpoint).host;

	const now = new Date();
	const amzDate =
		now.toISOString().replace(/[:-]/g, '').slice(0, 15) + 'Z';
	const dateStamp = amzDate.slice(0, 8);
	const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
	const credential = `${keyId}/${credentialScope}`;

	const queryEntries: [string, string][] = [
		['X-Amz-Algorithm', 'AWS4-HMAC-SHA256'],
		['X-Amz-Credential', credential],
		['X-Amz-Date', amzDate],
		['X-Amz-Expires', String(expiresIn)],
		['X-Amz-SignedHeaders', 'host'],
	];

	const canonicalQueryString = queryEntries
		.map(
			([key, value]) =>
				`${uriEncode(key, true)}=${uriEncode(value, true)}`,
		)
		.sort()
		.join('&');

	const canonicalUri =
		'/' +
		[bucket, ...objectKey.split('/')]
			.map((part) => uriEncode(part))
			.join('/');

	const canonicalRequest = [
		'GET',
		canonicalUri,
		canonicalQueryString,
		`host:${host}\n`,
		'host',
		'UNSIGNED-PAYLOAD',
	].join('\n');

	const stringToSign = [
		'AWS4-HMAC-SHA256',
		amzDate,
		credentialScope,
		createHash('sha256').update(canonicalRequest).digest('hex'),
	].join('\n');

	const signature = hmac(signingKey(appKey, dateStamp, region), stringToSign)
		.toString('hex');

	const signedQuery = `${canonicalQueryString}&X-Amz-Signature=${signature}`;
	return `https://${host}${canonicalUri}?${signedQuery}`;
}
