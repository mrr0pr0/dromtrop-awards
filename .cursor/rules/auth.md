# Auth Rules – NextAuth.js v5

## Setup
Use Auth.js v5 (`next-auth@beta`). Config lives at `src/lib/auth/config.ts` and `src/auth.ts`.

## Session Strategy
JWT sessions. Never database sessions (Neon is serverless, minimize connections).

## Sign-In Flow
1. User submits email
2. Check `approved_emails` table
3. If found → create/update user with `status = 'approved'`
4. If not found → create user with `status = 'pending'`
5. Send magic link email

## Middleware (src/middleware.ts)
Protect all routes under `/(protected)/`. Redirect unauthenticated users to `/login`.

## Role Check Pattern (Server Components)
```ts
import { auth } from "@/auth";

export default async function AdminPage() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    redirect("/");
  }
  // ...
}
```

## Role Check Pattern (API Routes)
```ts
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || session.user.status !== "approved") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  // ...
}
```

## Session Type Extension (src/types/next-auth.d.ts)
```ts
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "user" | "producer" | "admin";
      status: "approved" | "pending" | "rejected";
    };
  }
}
```
