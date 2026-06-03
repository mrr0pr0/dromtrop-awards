export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { listCategories } from "@/lib/db/categories";
import { listNomineesByCategory } from "@/lib/db/nominees";
import { getUserVotes } from "@/lib/db/votes";
import { CategoryList } from "@/components/voting/category-list";

export default async function VotePage() {
  const session = await auth();
  const categories = await listCategories(true);

  const categoriesWithNominees = await Promise.all(
    categories.map(async (category) => ({
      category,
      nominees: await listNomineesByCategory(category.id),
    })),
  );

  const userVotes = session?.user?.id
    ? await getUserVotes(session.user.id)
    : [];

  return (
    <div>
      <h1 className="font-[family-name:var(--font-display)] text-4xl font-light text-gold md:text-5xl">
        Stem nå
      </h1>
      <p className="mt-2 text-sm text-gold-light">
        Du kan stemme én gang per kategori. Velg din favoritt nedenfor.
      </p>
      <div className="mt-8">
        <CategoryList
          categories={categoriesWithNominees}
          userVotes={userVotes}
        />
      </div>
    </div>
  );
}
