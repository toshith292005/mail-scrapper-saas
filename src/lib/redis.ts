import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6380'

// Create a singleton instance
const globalForRedis = globalThis as unknown as { redis: Redis }

export const redis =
  globalForRedis.redis || new Redis(redisUrl, {
    maxRetriesPerRequest: null,
  })

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis
