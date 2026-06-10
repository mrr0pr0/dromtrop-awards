function isPrivateHost(host: string): boolean {
	const normalized = host.toLowerCase();
	return (
		normalized === 'localhost' ||
		normalized.endsWith('.local') ||
		normalized.startsWith('127.') ||
		normalized.startsWith('192.168.') ||
		normalized.startsWith('10.') ||
		/^172\.(1[6-9]|2\d|3[01])\./.test(normalized)
	);
}

/** Public site URL — used so media links work off WiFi / on mobile data. */
export function getPublicAppUrl(): string | null {
	const candidates = [
		process.env.NEXT_PUBLIC_APP_URL,
		process.env.AUTH_URL,
		process.env.COOLIFY_URL,
	];

	for (const raw of candidates) {
		if (!raw?.trim()) continue;

		let url = raw.trim().replace(/\/$/, '');
		if (!/^https?:\/\//i.test(url)) {
			url = `https://${url}`;
		}

		try {
			const { hostname, protocol } = new URL(url);
			if (protocol !== 'http:' && protocol !== 'https:') continue;
			if (isPrivateHost(hostname)) continue;
			return url;
		} catch {
			continue;
		}
	}

	return null;
}

export function toAbsoluteMediaUrl(url: string): string {
	if (/^https?:\/\//i.test(url)) {
		return url;
	}

	const base = getPublicAppUrl();
	if (!base) {
		return url;
	}

	return `${base}${url.startsWith('/') ? url : `/${url}`}`;
}
