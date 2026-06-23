import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const ROOT="/opt/whatsapp-forwarder/database";

const DB_FILE=
    path.join(ROOT,"app.db");

const SCHEMA_FILE=
    path.join(ROOT,"schema","schema.sql");

fs.mkdirSync(ROOT,{
    recursive:true
});

const db=new Database(DB_FILE);

db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

const schema=
    fs.readFileSync(
        SCHEMA_FILE,
        "utf8"
    );

db.exec(schema);

export default db;
