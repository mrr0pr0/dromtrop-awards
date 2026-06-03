import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import {
	isProducerOrAdmin,
	isAdmin,
} from '@/lib/auth/permissions';
import { Sidebar } from '@/components/layout/sidebar';

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const session = await auth();
	if (!isProducerOrAdmin(session)) {
		redirect('/results');
	}

	return (
		<div className="flex gap-6">
			<Sidebar isAdmin={isAdmin(session)} />
			<div className="min-w-0 flex-1">{children}</div>
		</div>
	);
}
