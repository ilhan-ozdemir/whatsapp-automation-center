import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const ROOT="/app/database";

fs.mkdirSync(ROOT,{
    recursive:true
});

const db=new Database(
    path.join(ROOT,"app.db")
);

const schema=fs.readFileSync(

    path.join(ROOT,"schema","schema.sql"),

    "utf8"

);

db.exec(schema);

export default db;
