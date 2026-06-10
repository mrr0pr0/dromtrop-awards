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

async function uploadViaServer(
	file: File,
	onProgress?: (pct: number) => void,
): Promise<string> {
	const formData = new FormData();
	formData.append('file', file);

	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', '/api/upload');

		if (onProgress) {
			xhr.upload.addEventListener('progress', (e) => {
				if (e.lengthComputable) {
					onProgress(Math.round((e.loaded / e.total) * 100));
				}
			});
		}

		xhr.onload = () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				try {
					const data = JSON.parse(xhr.responseText) as {
						url?: string;
						error?: string;
					};
					if (data.url) {
						resolve(data.url);
					} else {
						reject(new Error(data.error ?? 'Ingen URL returnert.'));
					}
				} catch {
					reject(new Error('Ugyldig svar fra serveren.'));
				}
			} else {
				try {
					const data = JSON.parse(xhr.responseText) as {
						error?: string;
					};
					reject(
						new Error(
							data.error ??
								`Opplasting feilet (${xhr.status}).`,
						),
					);
				} catch {
					reject(
						new Error(`Opplasting feilet (${xhr.status}).`),
					);
				}
			}
		};

		xhr.onerror = () => reject(new Error('Nettverksfeil ved opplasting.'));
		xhr.send(formData);
	});
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
	const [progress, setProgress] = useState<number | null>(null);
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
		setProgress(null);
		const objectUrl = URL.createObjectURL(file);
		setPreviewUrl(objectUrl);
		setPreviewIsVideo(isVideo);
		setUploading(true);

		try {
			const url = await uploadViaServer(file, (pct) => {
				setProgress(pct);
			});
			onChange(url);
			setPreviewUrl(null);
		} catch (err) {
			console.error('Upload exception:', err);
			setError(
				err instanceof Error
					? err.message
					: 'Nettverksfeil ved opplasting.',
			);
			setPreviewUrl(null);
		} finally {
			setUploading(false);
			setProgress(null);
		}
	}

	function handleRemove() {
		onChange(null);
		setPreviewUrl(null);
		setError(null);
		setPreviewIsVideo(false);
		setProgress(null);
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
										displayUrl.includes('/api/media/') ||
										displayUrl.includes('/api/upload/')
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
						<>
							<span>Laster opp...</span>
							{progress !== null && (
								<div className="w-48 overflow-hidden rounded-full bg-gold/20">
									<div
										className="h-1.5 rounded-full bg-gold transition-all duration-200"
										style={{ width: `${progress}%` }}
									/>
								</div>
							)}
							{progress !== null && (
								<span className="text-xs text-gold-light/70">
									{progress}%
								</span>
							)}
						</>
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
