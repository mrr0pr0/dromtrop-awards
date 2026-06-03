export const dynamic = "force-dynamic";

import { listCategories } from "@/lib/db/categories";
import { CategoriesManager } from "@/components/admin/categories-manager";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Kategorier</h1>
      <p className="mt-1 text-sm text-gold-light">
        Administrer priskategorier for IT-Gullruten 2026.
      </p>
      <div className="mt-6">
        <CategoriesManager initialCategories={categories} />
      </div>
    </div>
  );
}
