export function isVideoMediaUrl(url: string): boolean {
	const lower = url.toLowerCase().split('?')[0] ?? '';
	return (
		lower.endsWith('.mp4') ||
		lower.endsWith('.webm') ||
		lower.endsWith('.ogg') ||
		lower.endsWith('.mov')
	);
}
