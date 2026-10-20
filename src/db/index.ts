import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      port: process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      idleTimeoutMillis: 10000,
      connectionTimeoutMillis: 20000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 5000,
      allowExitOnIdle: true,
    });

    global._postgresPool.on('error', (_err) => {
      // Cloud SQL Developer Edition automatically closes idle connections when scaling to zero.
      // Attaching this listener prevents unhandled error events on idle clients in the pool;
      // the pool automatically discards the disconnected client and creates a fresh connection on the next query.
    });
  }
  return global._postgresPool;
};

export const pool = createPool();

export const db = drizzle(pool, { schema });

/**
 * Resilient query wrapper that retries transient connection drops (common with Cloud SQL idle timeouts)
 */
export async function withDbRetry<T>(queryFn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || '');
      const isTransientConnectionError = 
        msg.includes('Connection terminated') ||
        msg.includes('connection terminated') ||
        msg.includes('ECONNRESET') ||
        msg.includes('EPIPE') ||
        msg.includes('ETIMEDOUT') ||
        msg.includes('closed') ||
        err?.code === '57P01' || // admin_shutdown
        err?.code === '08006' || // connection_failure
        err?.code === '08003' || // connection_does_not_exist
        err?.code === '08001';   // sqlclient_unable_to_establish_sqlconnection

      if (isTransientConnectionError && attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
