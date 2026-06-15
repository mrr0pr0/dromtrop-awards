/**
 * Converts any YouTube URL format to an embeddable URL.
 * Handles: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID,
 * and already-embedded youtube.com/embed/ID URLs.
 * Returns the original URL unchanged if it is not a YouTube URL.
 */
export function toYouTubeEmbedUrl(url: string): string {
	try {
		const parsed = new URL(url);
		const host = parsed.hostname.replace(/^www\./, '');

		if (host === 'youtu.be') {
			const id = parsed.pathname.slice(1);
			return `https://www.youtube.com/embed/${id}`;
		}

		if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
			// Already an embed URL — return as-is
			if (parsed.pathname.startsWith('/embed/')) return url;

			// /shorts/VIDEO_ID
			const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?#]+)/);
			if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;

			// /watch?v=VIDEO_ID
			const v = parsed.searchParams.get('v');
			if (v) return `https://www.youtube.com/embed/${v}`;
		}
	} catch {
		// Not a valid URL — fall through
	}
	return url;
}

export function isVideoMediaUrl(url: string): boolean {
	const lower = url.toLowerCase().split('?')[0] ?? '';
	return (
		lower.endsWith('.mp4') ||
		lower.endsWith('.webm') ||
		lower.endsWith('.ogg') ||
		lower.endsWith('.mov')
	);
}