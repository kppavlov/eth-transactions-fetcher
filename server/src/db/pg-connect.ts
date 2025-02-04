import pg from "pg";

import envConfig from "../config";

pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => {
  return parseFloat(value);
});

class PgConnect {
  private static pool?: pg.Pool;
  private static instance?: PgConnect;

  constructor() {
    if (PgConnect.instance) {
      return PgConnect.instance;
    }
    PgConnect.instance = this;

    return this;
  }

  setPool(config: pg.PoolConfig) {
    if (PgConnect.pool) {
      return;
    }

    PgConnect.pool = new pg.Pool(config);
  }

  static getPool() {
    if (!PgConnect.pool) {
      throw new Error("Please create an instance first");
    }
    return PgConnect.pool;
  }

  static getInstance() {
    if (!PgConnect.instance) {
      throw new Error("Please create an instance first");
    }

    return this;
  }

  static async getClient() {
    if (!PgConnect.instance || !PgConnect.pool) {
      throw new Error("Please create an instance first");
    }

    return PgConnect.getInstance().getPool()?.connect();
  }

  static async query<R extends pg.QueryResultRow>(
    query: string,
    values?: any[],
  ) {
    const client = await PgConnect.getClient();
    const res = await client?.query<R>(query, values);

    client.release();

    return res.rows;
  }
}

const pgConfig = new PgConnect();

pgConfig.setPool({
  connectionString: envConfig.dbConnectionUrl,
});

export default PgConnect;
