import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { createAppAdapter } from "./adapter";

neonConfig.webSocketConstructor = ws;

let pool: Pool | undefined;

export function getAuthAdapter() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl });
  }
  return createAppAdapter(pool);
}
