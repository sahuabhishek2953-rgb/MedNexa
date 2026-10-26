import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema/index";

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/postgres";

const sql = neon(connectionString);

export const db: NeonHttpDatabase<typeof schema> = drizzle(sql, { schema });

export type Database = typeof db;
