export const dynamic = "force-dynamic";

import { listCategories } from "@/lib/db/categories";
import { listAllNominees } from "@/lib/db/nominees";
import { listUsers } from "@/lib/db/users";
import { NomineesManager } from "@/components/admin/nominees-manager";

export default async function AdminNomineesPage() {
  const [nominees, categories, users] = await Promise.all([
    listAllNominees(),
    listCategories(),
    listUsers(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-semibold text-white">Nominerte</h1>
      <p className="mt-1 text-sm text-gold-light">
        Legg til og administrer nominerte per kategori.
      </p>
      <div className="mt-6">
        <NomineesManager nominees={nominees} categories={categories} users={users} />
      </div>
    </div>
  );
}
