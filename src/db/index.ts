import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
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
      idleTimeoutMillis: 15000,
      connectionTimeoutMillis: 20000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 5000,
    });

    global._postgresPool.on('error', (err) => {
      // Cloud SQL Developer Edition automatically closes idle connections when scaling to zero.
      // Attaching this listener prevents unhandled error events on idle clients in the pool;
      // the pool automatically discards the disconnected client and creates a fresh connection on the next query.
      console.warn('SQL pool idle client warning:', err?.message || err);
    });
  }
  return global._postgresPool;
};

export const pool = createPool();

export const db = drizzle(pool, { schema });

/**
 * Inspect an error and its nested `cause` chain (DrizzleQueryError wraps pg errors in `err.cause`)
 * to detect transient Cloud SQL Auth Proxy / cold-start socket or connection errors.
 */
function isTransientDbError(err: any): boolean {
  const visited = new Set<any>();
  let current: any = err;

  while (current && typeof current === 'object' && !visited.has(current)) {
    visited.add(current);
    const code = String(current.code || '');
    const msg = String(current.message || '');

    if (
      code === 'ENOENT' ||
      code === 'ECONNREFUSED' ||
      code === 'ECONNRESET' ||
      code === 'EPIPE' ||
      code === 'ETIMEDOUT' ||
      code === 'EAGAIN' ||
      code === '57P01' || // admin_shutdown
      code === '57P03' || // cannot_connect_now (database starting up)
      code === '08006' || // connection_failure
      code === '08003' || // connection_does_not_exist
      code === '08001' || // sqlclient_unable_to_establish_sqlconnection
      msg.includes('ENOENT') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('ECONNRESET') ||
      msg.includes('EPIPE') ||
      msg.includes('ETIMEDOUT') ||
      msg.includes('Connection terminated') ||
      msg.includes('connection terminated') ||
      msg.includes('closed')
    ) {
      return true;
    }

    current = current.cause || current.originalError;
  }

  return false;
}

/**
 * When connecting via a Cloud SQL Auth Proxy Unix socket (`SQL_HOST` starting with `/`),
 * the proxy container may take 1-2 seconds after boot to create `.s.PGSQL.5432`.
 * Wait briefly for the socket file if it hasn't appeared yet.
 */
async function waitForUnixSocketIfNeeded(maxWaitMs = 3000): Promise<void> {
  const host = process.env.SQL_HOST;
  if (!host || !host.startsWith('/')) return;

  const port = process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432;
  const socketFile = path.join(host, `.s.PGSQL.${port}`);
  if (fs.existsSync(socketFile)) return;

  const deadline = Date.now() + maxWaitMs;
  while (Date.now() < deadline) {
    if (fs.existsSync(socketFile)) return;
    await new Promise((r) => setTimeout(r, 200));
  }
}

/**
 * Resilient query wrapper that retries transient connection drops and Cloud SQL proxy
 * Unix socket startup delays (ENOENT / DrizzleQueryError wrapping pg socket errors).
 */
export async function withDbRetry<T>(queryFn: () => Promise<T>, maxRetries = 5): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      await waitForUnixSocketIfNeeded(attempt === 0 ? 2500 : 1500);
      return await queryFn();
    } catch (err: any) {
      lastError = err;
      if (isTransientDbError(err) && attempt < maxRetries) {
        const baseDelay = Math.min(2000, 250 * Math.pow(1.6, attempt));
        const jitter = Math.floor(Math.random() * 120);
        await new Promise((r) => setTimeout(r, baseDelay + jitter));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}
