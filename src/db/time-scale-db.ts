import * as pgp from 'pg-promise';
import * as dotenv from 'dotenv';

dotenv.config();

export const timeScaleDb = pgp({})({
  host: process.env.TS_DB_HOST || '127.0.0.1',
  port: parseInt(process.env.TS_DB_PORT, 10) || 5432,
  database: process.env.TS_DB_NAME || 'jtl_report',
  user: process.env.TS_DB_USER || 'postgres',
  password: process.env.TS_DB_PASS,
  max: 60
});


