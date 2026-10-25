import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema/index";

const sql = neon(process.env.DATABASE_URL!);

export const db: NeonHttpDatabase<typeof schema> = drizzle(sql, { schema });

export type Database = typeof db;
