import path from "node:path";
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7 config: the CLI (migrate/studio/db push) reads the connection URL
// from here, via Prisma's own schema-engine MySQL connector — separate from
// the mariadb driver adapter the app runtime uses in src/server/db/client.ts.
// TiDB Cloud requires TLS; the schema engine needs that declared via the
// `sslaccept=strict` query param (its own SSL config isn't shared with the
// adapter's `ssl` option).
function withTidbTls(url: string) {
  const parsed = new URL(url);
  if (!parsed.searchParams.has("sslaccept")) {
    parsed.searchParams.set("sslaccept", "strict");
  }
  return parsed.toString();
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: withTidbTls(env("DATABASE_URL")),
  },
});
