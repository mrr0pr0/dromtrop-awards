import { auth } from '@/auth';
import { listCategories } from '@/lib/db/categories';
import {
	canVote,
	isAdmin,
} from '@/lib/auth/permissions';
import { NomineeSubmissionForm } from '@/components/voting/nominee-submission-form';

export const dynamic = 'force-dynamic';

export default async function NominatePage() {
	const session = await auth();
	const categories = await listCategories(true);
	const canNominate =
		canVote(session) || isAdmin(session);

	return (
		<div className="space-y-8">
			<div>
				<p className="text-xs font-extrabold uppercase tracking-[0.14em] text-gold-light">
					Nominerte
				</p>
				<h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl text-white md:text-5xl">
					Legg til nominert
				</h1>
				<p className="mt-3 max-w-2xl text-sm leading-relaxed text-gold-light md:text-base">
					Nominasjoner fra vanlige brukere blir sendt til
					godkjenning før de vises i avstemningen.
				</p>
			</div>

			<section className="rounded-[14px] border border-gold/20 bg-black p-5 md:p-6">
				{canNominate ? (
					<NomineeSubmissionForm categories={categories} />
				) : (
					<p className="text-sm text-gold-light">
						Du må være godkjent bruker for å sende inn
						nominerte.
					</p>
				)}
			</section>
		</div>
	);
}
