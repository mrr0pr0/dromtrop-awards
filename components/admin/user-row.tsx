"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";

interface UserRowProps {
  user: User;
  onStatusChange: () => void;
}

const statusLabels = {
  pending: "Venter",
  approved: "Godkjent",
  rejected: "Avvist",
};

export function UserRow({ user, onStatusChange }: UserRowProps) {
  const [loading, setLoading] = useState<string | null>(null);

  async function updateStatus(status: "approved" | "rejected") {
    setLoading(status);
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, status }),
      });
      if (res.ok) onStatusChange();
    } finally {
      setLoading(null);
    }
  }

  return (
    <tr className="border-b border-gold/10">
      <td className="px-4 py-3 text-white">{user.email}</td>
      <td className="px-4 py-3">
        <Badge variant={user.status === "pending" ? "warning" : "muted"}>
          {statusLabels[user.status]}
        </Badge>
      </td>
      <td className="px-4 py-3 text-gold-light">{user.role}</td>
      <td className="px-4 py-3">
        {user.status === "pending" && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              className="px-3 py-1 text-xs"
              isLoading={loading === "approved"}
              onClick={() => updateStatus("approved")}
            >
              Godkjenn
            </Button>
            <Button
              variant="outline"
              className="px-3 py-1 text-xs"
              isLoading={loading === "rejected"}
              onClick={() => updateStatus("rejected")}
            >
              Avvis
            </Button>
          </div>
        )}
      </td>
    </tr>
  );
}
