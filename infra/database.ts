import { Pool, type QueryResultRow } from 'pg';
import '@/infra/bigint';

export interface Database {
  getPool(): Pool;
  query<T extends QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<T[]>;
}

class DatabaseClient implements Database {
  private static instance: DatabaseClient;
  private pool: Pool;

  private constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }

  static getInstance(): DatabaseClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new DatabaseClient();
    }
    return DatabaseClient.instance;
  }

  getPool(): Pool {
    return this.pool;
  }

  async query<T extends QueryResultRow>(
    sql: string,
    params?: unknown[],
  ): Promise<T[]> {
    const result = await this.pool.query<T>(sql, params);
    return result.rows;
  }
}

const database = DatabaseClient.getInstance();
export default database;
