import { Pool } from "pg";

export const pool = new Pool({
  host: process.env.PGHOST ?? "127.0.0.1",
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER ?? "gigachat",
  password: process.env.PGPASSWORD ?? "gigachat",
  database: process.env.PGDATABASE ?? "gigachat",
});
