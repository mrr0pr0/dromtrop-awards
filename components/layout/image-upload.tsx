'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
	label?: string;
	value: string | null;
	onChange: (url: string | null) => void;
	className?: string;
}

export function ImageUpload({
	label = 'Bilde',
	value,
	onChange,
	className,
}: ImageUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

		setError(null);
		const objectUrl = URL.createObjectURL(file);
		setPreviewUrl(objectUrl);
		setUploading(true);

		try {
			const formData = new FormData();
			formData.append('file', file);

			const res = await fetch('/api/upload', {
				method: 'POST',
				body: formData,
			});
			const data = (await res.json()) as {
				url?: string;
				error?: string;
			};

			if (!res.ok || !data.url) {
				setError(data.error ?? 'Kunne ikke laste opp bildet.');
				setPreviewUrl(null);
				return;
			}

			onChange(data.url);
			setPreviewUrl(null);
		} catch {
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
	}

	const displayUrl = previewUrl ?? value;

	return (
		<div className={cn('flex flex-col gap-1.5', className)}>
			<span className="text-sm font-medium text-gold-light">
				{label}
			</span>

			{displayUrl ? (
				<div className="flex flex-wrap items-start gap-4">
					<div className="relative h-32 w-32 overflow-hidden rounded-lg border border-gold/30">
						<Image
							src={displayUrl}
							alt="Forhåndsvisning"
							fill
							className="object-cover"
							unoptimized={displayUrl.startsWith('blob:')}
						/>
					</div>
					<div className="flex flex-col gap-2">
						<Button
							type="button"
							variant="outline"
							className="text-xs"
							isLoading={uploading}
							onClick={() => inputRef.current?.click()}
						>
							Bytt bilde
						</Button>
						<Button
							type="button"
							variant="outline"
							className="text-xs"
							disabled={uploading}
							onClick={handleRemove}
						>
							Fjern bilde
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
					{uploading ? 'Laster opp...' : 'Klikk for å laste opp bilde'}
					<span className="text-xs text-gold-light/70">
						JPG, PNG, WebP eller GIF · maks 5 MB
					</span>
				</button>
			)}

			<input
				ref={inputRef}
				type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				className="hidden"
				onChange={handleFileChange}
			/>

			{error && <p className="text-xs text-red-400">{error}</p>}
		</div>
	);
}
