const Database = require("better-sqlite3");

const db = new Database("services.db");

// Creating a table if it doesn't exist(if not exists helps in this)
//autoincrement make ids automatically
//not null - those fields must be provided 
db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;
