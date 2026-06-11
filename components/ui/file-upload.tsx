'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
	label?: string;
	value: string | null;
	fileName?: string | null;
	onChange: (url: string | null, fileName: string | null) => void;
	className?: string;
}

async function uploadFile(
	file: File,
	onProgress?: (pct: number) => void,
): Promise<{ url: string; fileName: string }> {
	const formData = new FormData();
	formData.append('file', file);

	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		xhr.open('POST', '/api/upload/file');

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
						fileName?: string;
						error?: string;
					};
					if (data.url) {
						resolve({ url: data.url, fileName: data.fileName ?? file.name });
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
							data.error ?? `Opplasting feilet (${xhr.status}).`,
						),
					);
				} catch {
					reject(new Error(`Opplasting feilet (${xhr.status}).`));
				}
			}
		};

		xhr.onerror = () => reject(new Error('Nettverksfeil ved opplasting.'));
		xhr.send(formData);
	});
}

export function FileUpload({
	label = 'Nedlastbar fil',
	value,
	fileName,
	onChange,
	className,
}: FileUploadProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [uploading, setUploading] = useState(false);
	const [progress, setProgress] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		e.target.value = '';
		if (!file) return;

		const ext = file.name.split('.').pop()?.toLowerCase();
		if (ext !== 'zip' && ext !== 'exe') {
			setError('Kun ZIP og EXE filer er tillatt.');
			return;
		}

		setError(null);
		setProgress(null);
		setUploading(true);

		try {
			const { url, fileName: uploadedName } = await uploadFile(file, (pct) => {
				setProgress(pct);
			});
			onChange(url, uploadedName);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : 'Nettverksfeil ved opplasting.',
			);
		} finally {
			setUploading(false);
			setProgress(null);
		}
	}

	function handleRemove() {
		onChange(null, null);
		setError(null);
		setProgress(null);
	}

	return (
		<div className={cn('flex flex-col gap-1.5', className)}>
			<span className="text-sm font-medium text-gold-light">{label}</span>

			{value ? (
				<div className="flex flex-wrap items-center gap-4 rounded-lg border border-gold/30 bg-charcoal px-4 py-3">
					<div className="flex min-w-0 flex-1 items-center gap-2">
						<svg
							className="h-5 w-5 shrink-0 text-gold-light"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							strokeWidth={1.5}
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
							/>
						</svg>
						<span className="truncate text-sm text-white">
							{fileName ?? value.split('/').pop() ?? 'fil'}
						</span>
					</div>
					<div className="flex gap-2">
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
					className="flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gold/40 bg-charcoal px-4 py-5 text-sm text-gold-light transition-all duration-200 hover:border-gold disabled:cursor-not-allowed disabled:opacity-60"
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
								<span className="text-xs text-gold-light/70">{progress}%</span>
							)}
						</>
					) : (
						<>
							<svg
								className="h-6 w-6 text-gold-light/70"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={1.5}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
								/>
							</svg>
							<span>Klikk for å laste opp</span>
							<span className="text-xs text-gold-light/70">ZIP eller EXE · maks 500 MB</span>
						</>
					)}
				</button>
			)}

			<input
				ref={inputRef}
				type="file"
				accept=".zip,.exe,application/zip,application/x-zip-compressed,application/octet-stream,application/x-msdownload"
				className="hidden"
				onChange={handleFileChange}
			/>

			{error && <p className="text-xs text-red-400">{error}</p>}
		</div>
	);
}
