"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category, Nominee, User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "./data-table";

type NomineeRow = Nominee & { category_name: string };

interface NomineesManagerProps {
  nominees: NomineeRow[];
  categories: Category[];
  users: User[];
}

export function NomineesManager({
  nominees,
  categories,
  users,
}: NomineesManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(
    categories[0]?.id?.toString() ?? "",
  );
  const [userId, setUserId] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/nominees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        category_id: Number(categoryId),
        user_id: userId || null,
        image_url: imageUrl || null,
      }),
    });
    setName("");
    setUserId("");
    setImageUrl("");
    setLoading(false);
    router.refresh();
  }

  async function handleDelete(id: number) {
    if (!confirm("Slette denne nominerte?")) return;
    await fetch(`/api/nominees?id=${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Navn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gold-light">Kategori</label>
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
          <label className="text-sm font-medium text-gold-light">Bruker (valgfritt - for å forhindre å stemme på seg selv)</label>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="rounded-lg border border-gold/30 bg-charcoal px-4 py-3 text-sm text-white"
          >
            <option value="">-- Velg bruker (valgfritt) --</option>
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
        <Button type="submit" isLoading={loading}>
          Legg til nominert
        </Button>
      </form>

      <DataTable
        data={nominees}
        emptyMessage="Ingen nominerte"
        columns={[
          { key: "name", header: "Navn", render: (n) => n.name },
          {
            key: "category",
            header: "Kategori",
            render: (n) => n.category_name,
          },
          {
            key: "actions",
            header: "Handlinger",
            render: (n) => (
              <Button
                variant="outline"
                className="px-3 py-1 text-xs"
                onClick={() => handleDelete(n.id)}
              >
                Slett
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
