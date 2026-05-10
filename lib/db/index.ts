import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

// Lazy initialization — defers env-var read until first DB use.
// Without this, `next build`'s page-data collection fails when
// DATABASE_URL is not in the build environment.
let _db: ReturnType<typeof drizzle> | null = null;

function getDb(): ReturnType<typeof drizzle> {
  if (_db) return _db;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Set it in the runtime environment.",
    );
  }
  const sql = neon(url);
  _db = drizzle(sql);
  return _db;
}

// Proxy preserves the original `db.foo` access pattern.
// First property access triggers initialization; subsequent calls reuse.
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
