const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
const config = require("../config");

const dbPath = path.resolve(config.DB_PATH);
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");
console.log("✅ Database connected:", dbPath);

// Helper: run INSERT/UPDATE/DELETE
db.exec2 = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return Promise.resolve({ lastID: result.lastInsertRowid, changes: result.changes });
  } catch (err) {
    return Promise.reject(err);
  }
};

// Helper: get single row
db.get2 = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    return Promise.resolve(stmt.get(...params));
  } catch (err) {
    return Promise.reject(err);
  }
};

// Helper: get all rows
db.all2 = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    return Promise.resolve(stmt.all(...params));
  } catch (err) {
    return Promise.reject(err);
  }
};

// Init schema
const schemaPath = path.join(__dirname, "schema.sql");
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
}

module.exports = db;