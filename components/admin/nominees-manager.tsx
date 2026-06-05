'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type {
	Category,
	Nominee,
	NomineeStatus,
	User,
} from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getVisibleNomineeFields } from '@/lib/voting/category-layout';
import { DataTable } from './data-table';

type NomineeRow = Nominee & { category_name: string };

const statusLabels: Record<NomineeStatus, string> = {
	pending: 'Venter',
	approved: 'Godkjent',
	rejected: 'Avvist',
};

interface NomineesManagerProps {
	nominees: NomineeRow[];
	categories: Category[];
	users: User[];
}

function getCategoryName(
	categoryId: string,
	categories: Category[],
): string {
	const category = categories.find(
		(c) => c.id.toString() === categoryId,
	);
	return category?.name || '';
}

export function NomineesManager({
	nominees,
	categories,
	users,
}: NomineesManagerProps) {
	const router = useRouter();
	const [name, setName] = useState('');
	const [categoryId, setCategoryId] = useState(
		categories[0]?.id?.toString() ?? '',
	);
	const [userId, setUserId] = useState('');
	const [imageUrl, setImageUrl] = useState('');
	const [description, setDescription] = useState('');
	const [siteUrl, setSiteUrl] = useState('');
	const [videoUrl, setVideoUrl] = useState('');
	const [whatWeMade, setWhatWeMade] = useState('');
	const [loading, setLoading] = useState(false);
	const [statusLoading, setStatusLoading] = useState<
		number | null
	>(null);

	const visibleFields = getVisibleNomineeFields(
		getCategoryName(categoryId, categories),
	);

	async function handleCreate(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		await fetch('/api/nominees', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				name,
				category_id: Number(categoryId),
				user_id: userId || null,
				image_url: imageUrl || null,
				description: description || null,
				site_url: siteUrl || null,
				video_url: videoUrl || null,
				what_we_made: whatWeMade || null,
			}),
		});
		setName('');
		setUserId('');
		setImageUrl('');
		setDescription('');
		setSiteUrl('');
		setVideoUrl('');
		setWhatWeMade('');
		setLoading(false);
		router.refresh();
	}

	async function handleStatus(
		id: number,
		status: NomineeStatus,
	) {
		setStatusLoading(id);
		await fetch('/api/nominees', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, status }),
		});
		setStatusLoading(null);
		router.refresh();
	}

	async function handleDelete(id: number) {
		if (!confirm('Slette denne nominerte?')) return;
		await fetch(`/api/nominees?id=${id}`, {
			method: 'DELETE',
		});
		router.refresh();
	}

	return (
		<div className="space-y-8">
			<form
				onSubmit={handleCreate}
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
						{categories.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</div>
				<div className="flex flex-col gap-1.5">
					<label className="text-sm font-medium text-gold-light">
						Bruker (valgfritt - for å forhindre å stemme på
						seg selv)
					</label>
					<select
						value={userId}
						onChange={(e) => setUserId(e.target.value)}
						className="rounded-lg border border-gold/30 bg-charcoal px-4 py-3 text-sm text-white"
					>
						<option value="">
							-- Velg bruker (valgfritt) --
						</option>
						{users.map((u) => (
							<option key={u.id} value={u.id}>
								{u.name || u.email}
							</option>
						))}
					</select>
				</div>
				<Input
					label="Bilde-URL (Cloudinary)"
					value={imageUrl}
					onChange={(e) => setImageUrl(e.target.value)}
					placeholder="https://res.cloudinary.com/..."
					className="sm:col-span-2"
				/>

				{visibleFields.includes('description') && (
					<textarea
						placeholder="Beskrivelse av oppføringen"
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						className="rounded-lg border border-gold/30 bg-charcoal px-4 py-3 text-sm text-white placeholder-gold-light/50 sm:col-span-2"
						rows={3}
					/>
				)}

				{visibleFields.includes('site_url') && (
					<Input
						label="Nettside-URL"
						value={siteUrl}
						onChange={(e) => setSiteUrl(e.target.value)}
						placeholder="https://example.com"
						className="sm:col-span-2"
					/>
				)}

				{visibleFields.includes('video_url') && (
					<Input
						label="Video-URL (SharePoint embed)"
						value={videoUrl}
						onChange={(e) => setVideoUrl(e.target.value)}
						placeholder="https://..."
						className="sm:col-span-2"
					/>
				)}

				{visibleFields.includes('what_we_made') && (
					<textarea
						placeholder="Hva vi lagde (valgfritt)"
						value={whatWeMade}
						onChange={(e) => setWhatWeMade(e.target.value)}
						className="rounded-lg border border-gold/30 bg-charcoal px-4 py-3 text-sm text-white placeholder-gold-light/50 sm:col-span-2"
						rows={3}
					/>
				)}

				<Button type="submit" isLoading={loading}>
					Legg til nominert
				</Button>
			</form>

			<DataTable
				data={nominees}
				emptyMessage="Ingen nominerte"
				columns={[
					{
						key: 'name',
						header: 'Navn',
						render: (n) => n.name,
					},
					{
						key: 'category',
						header: 'Kategori',
						render: (n) => n.category_name,
					},
					{
						key: 'submitter',
						header: 'Sendt inn av',
						render: (n) => {
							const user = users.find(
								(u) => u.id === n.user_id,
							);
							return user?.name || user?.email || '-';
						},
					},
					{
						key: 'status',
						header: 'Status',
						render: (n) => (
							<span className="rounded-full border border-gold/30 px-2.5 py-1 text-xs text-gold-light">
								{statusLabels[n.status]}
							</span>
						),
					},
					{
						key: 'actions',
						header: 'Handlinger',
						render: (n) => (
							<div className="flex flex-wrap gap-2">
								{n.status !== 'approved' && (
									<Button
										className="px-3 py-1 text-xs"
										isLoading={statusLoading === n.id}
										onClick={() =>
											handleStatus(n.id, 'approved')
										}
									>
										Godkjenn
									</Button>
								)}
								{n.status !== 'rejected' && (
									<Button
										variant="outline"
										className="px-3 py-1 text-xs"
										isLoading={statusLoading === n.id}
										onClick={() =>
											handleStatus(n.id, 'rejected')
										}
									>
										Avvis
									</Button>
								)}
								<Button
									variant="outline"
									className="px-3 py-1 text-xs"
									onClick={() => handleDelete(n.id)}
								>
									Slett
								</Button>
							</div>
						),
					},
				]}
			/>
		</div>
	);
}
