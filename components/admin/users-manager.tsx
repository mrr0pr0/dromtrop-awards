"use client";

import { useRouter } from "next/navigation";
import type { User } from "@/types";
import { UserRow } from "./user-row";

interface UsersManagerProps {
  pendingUsers: User[];
}

export function UsersManager({ pendingUsers }: UsersManagerProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-lg border border-gold/20">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gold/20 bg-charcoal">
            <th className="px-4 py-3 font-medium text-gold-light">E-post</th>
            <th className="px-4 py-3 font-medium text-gold-light">Status</th>
            <th className="px-4 py-3 font-medium text-gold-light">Rolle</th>
            <th className="px-4 py-3 font-medium text-gold-light">Handlinger</th>
          </tr>
        </thead>
        <tbody>
          {pendingUsers.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-6 text-gold-light">
                Ingen ventende brukere.
              </td>
            </tr>
          ) : (
            pendingUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onStatusChange={() => router.refresh()}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
