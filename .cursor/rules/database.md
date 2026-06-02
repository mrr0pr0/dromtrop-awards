# Database Rules – Neon DB

## Driver
Always use `@neondatabase/serverless`. Import like this:
```ts
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
```

## Query Pattern
Use tagged template literals for parameterized queries:
```ts
// ✅ Correct
const users = await sql`SELECT * FROM users WHERE email = ${email}`;

// ❌ Never do this
const users = await sql(`SELECT * FROM users WHERE email = '${email}'`);
```

## Query File Location
All database queries live in `src/lib/db/`. Name files by entity:
- `src/lib/db/users.ts`
- `src/lib/db/categories.ts`
- `src/lib/db/nominees.ts`
- `src/lib/db/votes.ts`

## Connection
Create the client once per request (Neon handles pooling):
```ts
// src/lib/db/client.ts
import { neon } from "@neondatabase/serverless";
export const sql = neon(process.env.DATABASE_URL!);
```

## Transactions
```ts
import { neon } from "@neondatabase/serverless";
const sql = neon(process.env.DATABASE_URL!);
// Use sql.transaction() for multi-step operations
```

## Schema File
Always keep `schema.sql` at the project root up to date. It is the single source of truth for the database schema.
