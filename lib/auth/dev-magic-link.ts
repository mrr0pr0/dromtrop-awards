const TTL_MS = 15 * 60 * 1000;

type DevMagicLink = {
	email: string;
	url: string;
	at: number;
};

let last: DevMagicLink | null = null;

export function isDevMagicLinkMode(): boolean {
	return (
		process.env.NODE_ENV === 'development' &&
		process.env.AUTH_DEV_LOG_MAGIC_LINK === 'true'
	);
}

export function setDevMagicLink(
	email: string,
	url: string,
): void {
	if (!isDevMagicLinkMode()) return;
	last = { email, url, at: Date.now() };
}

export function getDevMagicLink(): DevMagicLink | null {
	if (!last) return null;
	if (Date.now() - last.at > TTL_MS) {
		last = null;
		return null;
	}
	return last;
}
