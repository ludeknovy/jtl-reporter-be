import * as pg from "pg-promise"
import * as dotenv from "dotenv"

dotenv.config()

const DEFAULT_PORT = 5432

export const db = pg({ })({
  host: process.env.DB_HOST || "127.0.0.1",
  port: parseInt(process.env.DB_PORT, 10) || DEFAULT_PORT,
  database: process.env.DB_NAME || "jtl_report",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS,
  max: 60,
})
