'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { resolveMediaUrl } from '@/lib/uploads/b2-media';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

type MediaType = 'image' | 'video';

interface MediaUploadProps {
	label?: string;
	value: string | null;
	onChange: (url: string | null) => void;
	className?: string;
	accept?: MediaType[];
}

const IMAGE_TYPES = new Set([
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
]);
const VIDEO_TYPES = new Set([
	'video/mp4',
	'video/webm',
	'video/ogg',
	'video/quicktime',
]);

function isVideoUrl(url: string): boolean {
	const lower = url.toLowerCase();
	return (
		lower.endsWith('.mp4') ||
		lower.endsWith('.webm') ||
		lower.endsWith('.ogg') ||
		lower.endsWith('.mov')
	);
}

function acceptString(accept: MediaType[]): string {
	const parts: string[] = [];
	if (accept.includes('image'))
		parts.push('image/jpeg,image/png,image/webp,image/gif');
	if (accept.includes('video'))
		parts.push('video/mp4,video/webm,video/ogg,video/quicktime');
	return parts.join(',');
}

function hintText(accept: MediaType[]): string {
	const hasImage = accept.includes('image');
	const hasVideo = accept.includes('video');
	if (hasImage && hasVideo)
		return 'JPG, PNG, WebP, GIF, MP4, WebM · maks 700 MB';
	if (hasVideo) return 'MP4, WebM, MOV · maks 700 MB';
	return 'JPG, PNG, WebP eller GIF · maks 5 MB';
}

export function MediaUpload({
	label = 'Mediefil',
	value,
	onChange,
	className,
	accept = ['image', 'video'],
}: MediaUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [previewIsVideo, setPreviewIsVideo] = useState(false);

	useEffect(() => {
		return () => {
			if (previewUrl?.startsWith('blob:')) {
				URL.revokeObjectURL(previewUrl);
			}
		};
	}, [previewUrl]);

	async function handleFileChange(
		e: React.ChangeEvent<HTMLInputElement>,
	) {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;

		const isVideo = VIDEO_TYPES.has(file.type);
		const isImage = IMAGE_TYPES.has(file.type);

		if (!isVideo && !isImage) {
			setError('Ugyldig filtype.');
			return;
		}

		setError(null);
		const objectUrl = URL.createObjectURL(file);
		setPreviewUrl(objectUrl);
		setPreviewIsVideo(isVideo);
		setUploading(true);

		try {
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});

			if (!res.ok) {
				const text = await res.text();
				console.error('Upload feil:', text);
				setError(`Opplasting feilet (${res.status}) – sjekk konsollen`);
				setPreviewUrl(null);
				return;
			}

			const data = (await res.json()) as {
				url?: string;
				error?: string;
			};

			if (!data.url) {
				setError(data.error ?? 'Kunne ikke laste opp filen.');
				setPreviewUrl(null);
				return;
			}

			onChange(data.url);
			setPreviewUrl(null);
		} catch (err) {
			console.error('Upload exception:', err);
			setError('Nettverksfeil ved opplasting.');
			setPreviewUrl(null);
		} finally {
			setUploading(false);
		}
	}

	function handleRemove() {
		onChange(null);
		setPreviewUrl(null);
		setError(null);
		setPreviewIsVideo(false);
	}

	const displayUrl = previewUrl ?? resolveMediaUrl(value);
	const showAsVideo =
		previewIsVideo || (!!displayUrl && isVideoUrl(displayUrl));

	return (
		<div className={cn('flex flex-col gap-1.5', className)}>
			<span className="text-sm font-medium text-gold-light">
				{label}
			</span>

			{displayUrl ? (
				<div className="flex flex-wrap items-start gap-4">
					<div className="relative overflow-hidden rounded-lg border border-gold/30 bg-black">
						{showAsVideo ? (
							<video
								src={displayUrl}
								controls
								className="max-h-48 w-full max-w-xs rounded-lg object-contain"
							/>
						) : (
							<div className="relative h-32 w-32">
								<Image
									src={displayUrl}
									alt="Forhåndsvisning"
									fill
									className="object-cover"
									unoptimized={
										displayUrl.startsWith('blob:') ||
										displayUrl.startsWith('/api/media/')
									}
								/>
							</div>
						)}
					</div>
					<div className="flex flex-col gap-2">
						<Button
							type="button"
							variant="outline"
							className="text-xs"
							isLoading={uploading}
							onClick={() => inputRef.current?.click()}
						>
							Bytt fil
						</Button>
						<Button
							type="button"
							variant="outline"
							className="text-xs"
							disabled={uploading}
							onClick={handleRemove}
						>
							Fjern fil
						</Button>
					</div>
				</div>
			) : (
				<button
					type="button"
					disabled={uploading}
					onClick={() => inputRef.current?.click()}
					className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gold/40 bg-charcoal px-4 py-6 text-sm text-gold-light transition-all duration-200 hover:border-gold disabled:cursor-not-allowed disabled:opacity-60"
				>
					{uploading ? (
						<span>Laster opp...</span>
					) : (
						<>
							<span>Klikk for å laste opp</span>
							{accept.includes('image') &&
								accept.includes('video') && (
									<span className="text-xs text-gold-light/70">
										Bilde eller video
									</span>
								)}
						</>
					)}
					<span className="text-xs text-gold-light/70">
						{hintText(accept)}
					</span>
				</button>
			)}

			<input
				ref={inputRef}
				type="file"
				accept={acceptString(accept)}
				className="hidden"
				onChange={handleFileChange}
			/>

			{error && <p className="text-xs text-red-400">{error}</p>}
		</div>
	);
}