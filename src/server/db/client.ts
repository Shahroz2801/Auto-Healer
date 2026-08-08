import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

/**
 * Prisma's connection pool must survive Next.js dev-server hot reloads, so we
 * stash the client on `globalThis` in development to avoid exhausting the
 * database's connection limit every time a file is saved.
 *
 * Prisma 7 requires an explicit driver adapter instead of reading
 * `datasource.url` from the schema — see prisma.config.ts for the CLI side.
 *
 * The database is TiDB Cloud (MySQL wire protocol), which requires TLS and
 * doesn't accept a bare connection string for that, so we parse
 * DATABASE_URL into a mariadb PoolConfig instead of passing the URL through.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = new URL(process.env.DATABASE_URL ?? "");

  const adapter = new PrismaMariaDb(
    {
      host: url.hostname,
      port: url.port ? Number(url.port) : 4000,
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, "") || undefined,
      ssl: { minVersion: "TLSv1.2", rejectUnauthorized: true },
      connectionLimit: 5,
      // TiDB Cloud Serverless resets idle connections well before the
      // mariadb driver's own 30-minute default, which otherwise leaves a
      // dead socket sitting in the pool. Recycle proactively so we never
      // hand out a connection TiDB has already closed on its end.
      idleTimeout: 60,
    },
    {
      // Without this, an 'error' event on a pooled connection (e.g. the
      // remote reset above racing a borrow) has no listener — Node treats
      // an unhandled EventEmitter 'error' as fatal and kills the whole
      // process. This turns that into a logged, recoverable error instead.
      onConnectionError: (err) => {
        console.error("[db] connection error", err);
      },
    }
  );

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
