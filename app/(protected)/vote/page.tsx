export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { listCategories } from "@/lib/db/categories";
import { listNomineesByCategory } from "@/lib/db/nominees";
import { getUserVotes } from "@/lib/db/votes";
import { CategoryPicker } from "@/components/voting/category-picker";

export default async function VotePage() {
  const session = await auth();
  const categories = await listCategories(true);

  const categoriesWithNominees = await Promise.all(
    categories.map(async (category) => ({
      category,
      nominees: await listNomineesByCategory(category.id),
    })),
  );

  // Transform data structure for CategoryPicker
  const nominees: Record<number, typeof categoriesWithNominees[0]["nominees"]> = {};
  categoriesWithNominees.forEach(({ category, nominees: categoryNominees }) => {
    nominees[category.id] = categoryNominees;
  });

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
        <CategoryPicker
          categories={categories}
          nominees={nominees}
          userVotes={userVotes}
          currentUserId={session?.user?.id}
        />
      </div>
    </div>
  );
}
