import IORedis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: IORedis | undefined };

/** Shared connection for all BullMQ queues/workers. BullMQ requires
 * `maxRetriesPerRequest: null` on the connection it's given — without it,
 * blocking commands (used internally for job polling) fail after the
 * default retry limit. */
function createConnection() {
  return new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
    maxRetriesPerRequest: null,
  });
}

export const redisConnection = globalForRedis.redis ?? createConnection();

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redisConnection;
