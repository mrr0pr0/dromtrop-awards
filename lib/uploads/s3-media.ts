import { createHash, createHmac } from 'crypto';

export type UploadStorage = 'local' | 's3' | 'cloudinary';

export type S3Config = {
	endpoint: string;
	bucket: string;
	accessKeyId: string;
	secretAccessKey: string;
	region: string;
	publicWebUrl: string;
	publicBucket: boolean;
};

export function getS3Config(): S3Config | null {
	const endpoint = (
		process.env.S3_ENDPOINT ??
		process.env.B2_ENDPOINT ??
		''
	).trim();
	const bucket = (
		process.env.S3_BUCKET ??
		process.env.B2_BUCKET ??
		''
	).trim();
	const accessKeyId = (
		process.env.S3_ACCESS_KEY_ID ??
		process.env.B2_KEY_ID ??
		''
	).trim();
	const secretAccessKey = (
		process.env.S3_SECRET_ACCESS_KEY ??
		process.env.B2_APPLICATION_KEY ??
		''
	).trim();

	if (!endpoint || !bucket || !accessKeyId || !secretAccessKey) {
		return null;
	}

	const normalizedEndpoint = normalizeS3Endpoint(endpoint);
	const region = (
		process.env.S3_REGION ??
		process.env.B2_REGION ??
		inferS3Region(normalizedEndpoint)
	).trim();
	const publicWebUrl = (
		process.env.S3_PUBLIC_WEB_URL ??
		process.env.B2_PUBLIC_URL ??
		''
	).trim();
	const publicBucket =
		process.env.S3_PUBLIC_BUCKET === 'true' ||
		process.env.B2_PUBLIC_BUCKET === 'true';

	return {
		endpoint: normalizedEndpoint,
		bucket,
		accessKeyId,
		secretAccessKey,
		region,
		publicWebUrl,
		publicBucket,
	};
}

export function isS3Configured(): boolean {
	return getS3Config() !== null;
}

/** @deprecated Use isS3Configured */
export const isB2Configured = isS3Configured;

export function getUploadStorage(): UploadStorage {
	const mode = process.env.UPLOAD_STORAGE?.trim().toLowerCase();
	if (mode === 'local' || mode === 's3' || mode === 'cloudinary') {
		return mode;
	}
	// Backwards compatibility with older env value
	if (mode === 'b2') return 's3';
	if (isS3Configured()) return 's3';
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

export function normalizeS3Endpoint(raw: string): string {
	const endpoint = raw.trim().replace(/\/$/, '');
	if (/^https?:\/\//i.test(endpoint)) {
		return endpoint;
	}
	return `https://${endpoint}`;
}

/** @deprecated Use normalizeS3Endpoint */
export const normalizeB2Endpoint = normalizeS3Endpoint;

function inferS3Region(endpoint: string): string {
	const b2Match = endpoint.match(/s3\.([^.]+)\.backblazeb2\.com/);
	if (b2Match) return b2Match[1];
	return 'garage';
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

function parseBackblazeObjectKey(url: string): string | null {
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

export function parseS3ObjectKey(url: string): string | null {
	const backblazeKey = parseBackblazeObjectKey(url);
	if (backblazeKey) return backblazeKey;

	try {
		const parsed = new URL(url);
		const parts = parsed.pathname.split('/').filter(Boolean);
		if (parts.length === 0) return null;

		const config = getS3Config();
		if (config && parts[0] === config.bucket && parts.length > 1) {
			return decodeURIComponent(parts.slice(1).join('/'));
		}

		if (parts[0] === 'nominees') {
			return decodeURIComponent(parts.join('/'));
		}
	} catch {
		return null;
	}

	return null;
}

/** @deprecated Use parseS3ObjectKey */
export const parseB2ObjectKey = parseS3ObjectKey;

export function isS3StorageUrl(url: string): boolean {
	return parseS3ObjectKey(url) !== null;
}

/** @deprecated Use isS3StorageUrl */
export const isB2StorageUrl = isS3StorageUrl;

export function resolveMediaUrl(
	url: string | null | undefined,
): string | null {
	if (!url) return null;

	const objectKey = parseS3ObjectKey(url);
	if (objectKey?.startsWith('nominees/')) {
		const config = getS3Config();
		if (
			typeof window === 'undefined' &&
			config?.publicBucket &&
			config.publicWebUrl
		) {
			return buildS3PublicObjectUrl(objectKey, config);
		}
		return `/api/media/${objectKey}`;
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

export function buildS3PublicObjectUrl(
	key: string,
	config: S3Config = getS3Config()!,
): string {
	if (config.publicWebUrl) {
		return `${config.publicWebUrl.replace(/\/$/, '')}/${config.bucket}/${key}`;
	}

	if (config.endpoint.includes('backblazeb2.com')) {
		return `https://${config.bucket}.s3.${config.region}.backblazeb2.com/${key}`;
	}

	return `${config.endpoint}/${config.bucket}/${key}`;
}

/** @deprecated Use buildS3PublicObjectUrl */
export function buildB2PublicObjectUrl(key: string): string {
	const config = getS3Config();
	if (!config) {
		throw new Error('S3 is not configured.');
	}
	return buildS3PublicObjectUrl(key, config);
}

export function buildStoredMediaUrl(key: string): string {
	const config = getS3Config();
	if (!config) {
		return `/api/media/${key}`;
	}
	if (config.publicBucket && config.publicWebUrl) {
		return buildS3PublicObjectUrl(key, config);
	}
	return `/api/media/${key}`;
}

export function createS3PresignedGetUrl(
	objectKey: string,
	expiresIn = 3600,
	config: S3Config = getS3Config()!,
): string {
	const host = new URL(config.endpoint).host;

	const now = new Date();
	const amzDate =
		now.toISOString().replace(/[:-]/g, '').slice(0, 15) + 'Z';
	const dateStamp = amzDate.slice(0, 8);
	const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
	const credential = `${config.accessKeyId}/${credentialScope}`;

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
		[config.bucket, ...objectKey.split('/')]
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

	const signature = hmac(
		signingKey(config.secretAccessKey, dateStamp, config.region),
		stringToSign,
	).toString('hex');

	const signedQuery = `${canonicalQueryString}&X-Amz-Signature=${signature}`;
	return `${config.endpoint}${canonicalUri}?${signedQuery}`;
}

/** @deprecated Use createS3PresignedGetUrl */
export function createB2PresignedGetUrl(
	objectKey: string,
	expiresIn = 3600,
): string {
	const config = getS3Config();
	if (!config) {
		throw new Error('S3 is not configured.');
	}
	return createS3PresignedGetUrl(objectKey, expiresIn, config);
}

export async function uploadToS3(
	file: File,
	key: string,
): Promise<void> {
	const config = getS3Config();
	if (!config) {
		throw new Error('S3 is not configured.');
	}

	const buffer = Buffer.from(await file.arrayBuffer());
	const url = `${config.endpoint}/${config.bucket}/${key}`;
	const host = new URL(config.endpoint).host;

	const now = new Date();
	const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
	const amzDate = now.toISOString().replace(/[:-]/g, '').slice(0, 15) + 'Z';
	const payloadHash = createHash('sha256').update(buffer).digest('hex');

	const canonicalUri =
		'/' +
		[config.bucket, ...key.split('/')]
			.map((part) => uriEncode(part))
			.join('/');

	const canonicalHeaders =
		`content-length:${buffer.length}\n` +
		`content-type:${file.type}\n` +
		`host:${host}\n` +
		`x-amz-content-sha256:${payloadHash}\n` +
		`x-amz-date:${amzDate}\n`;
	const signedHeaders =
		'content-length;content-type;host;x-amz-content-sha256;x-amz-date';

	const canonicalRequest = [
		'PUT',
		canonicalUri,
		'',
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	].join('\n');

	const credentialScope = `${dateStamp}/${config.region}/s3/aws4_request`;
	const stringToSign = [
		'AWS4-HMAC-SHA256',
		amzDate,
		credentialScope,
		createHash('sha256').update(canonicalRequest).digest('hex'),
	].join('\n');

	const signature = hmac(
		signingKey(config.secretAccessKey, dateStamp, config.region),
		stringToSign,
	).toString('hex');

	const authorization =
		`AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${credentialScope}, ` +
		`SignedHeaders=${signedHeaders}, Signature=${signature}`;

	let res: Response;
	try {
		res = await fetch(url, {
			method: 'PUT',
			headers: {
				'Content-Length': String(buffer.length),
				'Content-Type': file.type,
				'x-amz-content-sha256': payloadHash,
				'x-amz-date': amzDate,
				Authorization: authorization,
			},
			body: buffer,
		});
	} catch (err) {
		const cause = err instanceof Error ? (err as NodeJS.ErrnoException).cause ?? err.message : err;
		console.error('[s3-upload] fetch threw (network error):', {
			url,
			endpoint: config.endpoint,
			bucket: config.bucket,
			key,
			cause,
		});
		throw err;
	}

	if (!res.ok) {
		const text = await res.text();
		console.error('[s3-upload] PUT failed:', {
			status: res.status,
			endpoint: config.endpoint,
			bucket: config.bucket,
			key,
			region: config.region,
			body: text.slice(0, 500),
		});
		if (
			res.status === 403 &&
			text.includes('Malformed Access Key Id')
		) {
			throw new Error(
				'Ugyldig S3-nøkkel. For Backblaze: bruk en vanlig Application Key, ikke Master Key.',
			);
		}
		throw new Error(`S3-opplasting feilet: ${res.status} ${text}`);
	}
}
