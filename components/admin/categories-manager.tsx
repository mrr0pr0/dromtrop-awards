"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "./data-table";
import { Badge } from "@/components/ui/badge";

interface CategoriesManagerProps {
  initialCategories: Category[];
}

export function CategoriesManager({
  initialCategories,
}: CategoriesManagerProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || null }),
    });
    setName("");
    setDescription("");
    setLoading(false);
    router.refresh();
  }

  async function toggleActive(category: Category) {
    await fetch("/api/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category.id, is_active: !category.is_active }),
    });
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="flex flex-wrap gap-4">
        <Input
          label="Navn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="min-w-[200px]"
        />
        <Input
          label="Beskrivelse"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-w-[200px] flex-1"
        />
        <div className="flex items-end">
          <Button type="submit" isLoading={loading}>
            Legg til kategori
          </Button>
        </div>
      </form>

      <DataTable
        data={initialCategories}
        emptyMessage="Ingen kategorier"
        columns={[
          { key: "name", header: "Navn", render: (c) => c.name },
          {
            key: "active",
            header: "Status",
            render: (c) => (
              <Badge variant={c.is_active ? "success" : "muted"}>
                {c.is_active ? "Aktiv" : "Inaktiv"}
              </Badge>
            ),
          },
          {
            key: "actions",
            header: "Handlinger",
            render: (c) => (
              <Button
                variant="outline"
                className="px-3 py-1 text-xs"
                onClick={() => toggleActive(c)}
              >
                {c.is_active ? "Deaktiver" : "Aktiver"}
              </Button>
            ),
          },
        ]}
      />
    </div>
  );
}
