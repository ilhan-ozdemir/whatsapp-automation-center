import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import config from "../../config.js";

fs.mkdirSync(path.dirname(config.DATABASE_PATH), { recursive: true });
const db = new Database(config.DATABASE_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
// The schema belongs to the code, independently of the persistent data location.
db.exec(fs.readFileSync(new URL("../schema/schema.sql", import.meta.url), "utf8"));
export default db;
