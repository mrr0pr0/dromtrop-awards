export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getCategoryById } from "@/lib/db/categories";
import { getNomineeById, listNomineesByCategory } from "@/lib/db/nominees";
import { getUserVotes } from "@/lib/db/votes";
import { NomineeDetailClient } from "@/components/voting/nominee-detail-client";

interface NomineeDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function NomineeDetailPage({ params }: NomineeDetailPageProps) {
  const { id } = await params;
  const nomineeId = Number(id);
  if (!Number.isFinite(nomineeId) || nomineeId <= 0) notFound();

  const nominee = await getNomineeById(nomineeId);
  if (!nominee) notFound();

  const category = await getCategoryById(nominee.category_id);
  if (!category) notFound();

  const session = await auth();
  const categoryNominees = await listNomineesByCategory(category.id);
  const userVotes = session?.user?.id
    ? await getUserVotes(session.user.id)
    : [];

  return (
    <NomineeDetailClient
      nominee={nominee}
      category={category}
      userVotes={userVotes}
      currentUserId={session?.user?.id}
      nomineeCountInCategory={categoryNominees.length}
    />
  );
}
