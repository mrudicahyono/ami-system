const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");
const config = require("../config");

const dbPath = path.resolve(config.DB_PATH);
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) { console.error("DB error:", err); process.exit(1); }
  console.log("✅ Database connected:", dbPath);
});

db.serialize(() => {
  db.run("PRAGMA foreign_keys = ON");
  db.run("PRAGMA journal_mode = WAL");
});

// Helper: run INSERT/UPDATE/DELETE
db.exec2 = (sql, params = []) =>
  new Promise((res, rej) =>
    db.run(sql, params, function (err) {
      if (err) return rej(err);
      res({ lastID: this.lastID, changes: this.changes });
    })
  );

// Helper: get single row
db.get2 = (sql, params = []) =>
  new Promise((res, rej) =>
    db.get(sql, params, (err, row) => (err ? rej(err) : res(row)))
  );

// Helper: get all rows
db.all2 = (sql, params = []) =>
  new Promise((res, rej) =>
    db.all(sql, params, (err, rows) => (err ? rej(err) : res(rows)))
  );

// Init schema
const schemaPath = path.join(__dirname, "schema.sql");
if (fs.existsSync(schemaPath)) {
  const schema = fs.readFileSync(schemaPath, "utf8");
  const stmts = schema.split(";").map(s => s.trim()).filter(Boolean);
  db.serialize(() => { stmts.forEach(s => db.run(s)); });
}

module.exports = db;
