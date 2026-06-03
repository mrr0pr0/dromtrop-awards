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

// Category name to optional fields mapping (case-insensitive)
const CATEGORY_FIELDS_MAP: Record<string, string[]> = {
  "beste medieproduksjon": ["description"],
  "beste medieprudukt": ["description"],
  "beste it-produkt": ["description", "site_url"],
  "beste app": ["description", "site_url"],
  "beste konsept": ["description"],
  "beste kortfilm": ["description", "video_url"],
  "mest originale idé": ["description", "what_we_made"],
  "beste interaktiv": ["description", "site_url"],
  "beste animasjon": [],
  "beste historiefortelling": ["description"],
};

function getVisibleFields(categoryName: string): string[] {
  const normalized = categoryName.trim().toLowerCase();
  return CATEGORY_FIELDS_MAP[normalized] || [];
}

function getCategoryName(categoryId: string, categories: Category[]): string {
  const category = categories.find((c) => c.id.toString() === categoryId);
  return category?.name || "";
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
  const [description, setDescription] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [whatWeMade, setWhatWeMade] = useState("");
  const [loading, setLoading] = useState(false);

  const visibleFields = getVisibleFields(getCategoryName(categoryId, categories));

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
        description: description || null,
        site_url: siteUrl || null,
        video_url: videoUrl || null,
        what_we_made: whatWeMade || null,
      }),
    });
    setName("");
    setUserId("");
    setImageUrl("");
    setDescription("");
    setSiteUrl("");
    setVideoUrl("");
    setWhatWeMade("");
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

        {visibleFields.includes("description") && (
          <textarea
            placeholder="Beskrivelse av oppføringen"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-lg border border-gold/30 bg-charcoal px-4 py-3 text-sm text-white placeholder-gold-light/50 sm:col-span-2"
            rows={3}
          />
        )}

        {visibleFields.includes("site_url") && (
          <Input
            label="Nettside-URL"
            value={siteUrl}
            onChange={(e) => setSiteUrl(e.target.value)}
            placeholder="https://example.com"
            className="sm:col-span-2"
          />
        )}

        {visibleFields.includes("video_url") && (
          <Input
            label="Video-URL (SharePoint embed)"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://..."
            className="sm:col-span-2"
          />
        )}

        {visibleFields.includes("what_we_made") && (
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
