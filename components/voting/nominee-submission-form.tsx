'use client';

import { useMemo, useState } from 'react';
import type { Category } from '@/types';
import { Button } from '@/components/ui/button';
import { MediaUpload } from '@/components/ui/media-upload';
import { Input } from '@/components/ui/input';
import { getVisibleNomineeFields } from '@/lib/voting/category-layout';

interface NomineeSubmissionFormProps {
	categories: Category[];
}

function getCategoryName(
	categoryId: string,
	categories: Category[],
) {
	return (
		categories.find(
			(category) => category.id.toString() === categoryId,
		)?.name ?? ''
	);
}

export function NomineeSubmissionForm({
	categories,
}: NomineeSubmissionFormProps) {
	const [name, setName] = useState('');
	const [categoryId, setCategoryId] = useState(
		categories[0]?.id?.toString() ?? '',
	);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [description, setDescription] = useState('');
	const [siteUrl, setSiteUrl] = useState('');
	const [videoUrl, setVideoUrl] = useState('');
	const [whatWeMade, setWhatWeMade] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(
		null,
	);
	const [error, setError] = useState<string | null>(null);

	const visibleFields = useMemo(
		() =>
			getVisibleNomineeFields(
				getCategoryName(categoryId, categories),
			),
		[categoryId, categories],
	);

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		setError(null);

		try {
			const res = await fetch('/api/nominees', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name,
					category_id: Number(categoryId),
					image_url: imageUrl || null,
					description: description || null,
					site_url: siteUrl || null,
					video_url: videoUrl || null,
					what_we_made: whatWeMade || null,
				}),
			});

			const data = (await res.json()) as { error?: string };
			if (!res.ok) {
				setError(
					data.error || 'Kunne ikke sende inn nominert.',
				);
				return;
			}

			setName('');
			setImageUrl(null);
			setDescription('');
			setSiteUrl('');
			setVideoUrl('');
			setWhatWeMade('');
			setMessage(
				'Nominasjonen er sendt inn og venter på godkjenning.',
			);
		} catch {
			setError('Nettverksfeil. Prøv igjen.');
		} finally {
			setLoading(false);
		}
	}

	return (
		<form
			onSubmit={handleSubmit}
			className="grid gap-4 sm:grid-cols-2"
		>
			<Input
				label="Navn"
				value={name}
				onChange={(e) => setName(e.target.value)}
				required
			/>
			<div className="flex flex-col gap-1.5">
				<label className="text-sm font-medium text-gold-light">
					Kategori
				</label>
				<select
					value={categoryId}
					onChange={(e) => setCategoryId(e.target.value)}
					className="rounded-lg border border-gold/30 bg-charcoal px-4 py-3 text-sm text-white"
					required
				>
					{categories.map((category) => (
						<option key={category.id} value={category.id}>
							{category.name}
						</option>
					))}
				</select>
			</div>

			<MediaUpload
				label="Bilde / video"
				value={imageUrl}
				onChange={setImageUrl}
				className="sm:col-span-2"
			/>

			{visibleFields.includes('description') && (
				<textarea
					aria-label="Beskrivelse"
					placeholder="Beskrivelse"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="rounded-lg border border-gold/30 bg-charcoal px-4 py-3 text-sm text-white placeholder-gold-light/50 sm:col-span-2"
					rows={4}
				/>
			)}

			{visibleFields.includes('site_url') && (
				<Input
					label="Nettside-URL"
					value={siteUrl}
					onChange={(e) => setSiteUrl(e.target.value)}
					placeholder="https://..."
					className="sm:col-span-2"
				/>
			)}

			{visibleFields.includes('video_url') && (
				<Input
					label="Video-URL"
					value={videoUrl}
					onChange={(e) => setVideoUrl(e.target.value)}
					placeholder="https://..."
					className="sm:col-span-2"
				/>
			)}

			{visibleFields.includes('what_we_made') && (
				<textarea
					aria-label="Hva vi lagde"
					placeholder="Hva vi lagde"
					value={whatWeMade}
					onChange={(e) => setWhatWeMade(e.target.value)}
					className="rounded-lg border border-gold/30 bg-charcoal px-4 py-3 text-sm text-white placeholder-gold-light/50 sm:col-span-2"
					rows={4}
				/>
			)}

			<div className="flex flex-wrap items-center gap-3 sm:col-span-2">
				<Button type="submit" isLoading={loading}>
					Send inn nominert
				</Button>
				{message && (
					<p className="text-sm text-gold-light">
						{message}
					</p>
				)}
				{error && (
					<p className="text-sm text-red-300">{error}</p>
				)}
			</div>
		</form>
	);
}
