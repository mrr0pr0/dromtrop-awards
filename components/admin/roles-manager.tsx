"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User, UserRole } from "@/types";
import { DataTable } from "./data-table";
interface RolesManagerProps {
  users: User[];
}

export function RolesManager({ users }: RolesManagerProps) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function updateRole(userId: string, role: UserRole) {
    setLoadingId(userId);
    await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, role }),
    });
    setLoadingId(null);
    router.refresh();
  }

  return (
    <DataTable
      data={users}
      emptyMessage="Ingen brukere"
      columns={[
        { key: "email", header: "E-post", render: (u) => u.email },
        { key: "status", header: "Status", render: (u) => u.status },
        {
          key: "role",
          header: "Rolle",
          render: (u) => (
            <select
              value={u.role}
              disabled={loadingId === u.id}
              onChange={(e) =>
                updateRole(u.id, e.target.value as UserRole)
              }
              className="rounded-lg border border-gold/30 bg-black px-2 py-1 text-sm text-white"
            >
              <option value="user">Bruker</option>
              <option value="producer">Produsent</option>
              <option value="admin">Admin</option>
            </select>
          ),
        },
        {
          key: "save",
          header: "",
          render: () => null,
        },
      ]}
    />
  );
}
