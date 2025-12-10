import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Database file path
const DB_PATH = path.join(process.cwd(), "data", "coffee.db");

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database connection
const db = new Database(DB_PATH);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS creators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    walletAddress TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_wallet_address ON creators(walletAddress);
`);

// Helper function to get creator by wallet address
export function getCreator(walletAddress: string) {
  const stmt = db.prepare("SELECT * FROM creators WHERE walletAddress = ?");
  return stmt.get(walletAddress) as
    | {
      id: number;
      walletAddress: string;
      name: string;
      bio: string | null;
      createdAt: string;
      updatedAt: string;
    }
    | undefined;
}

// Helper function to upsert creator profile
export function upsertCreator(
  walletAddress: string,
  name: string,
  bio: string | null
) {
  const existing = getCreator(walletAddress);

  if (existing) {
    // Update existing creator
    const stmt = db.prepare(
      "UPDATE creators SET name = ?, bio = ?, updatedAt = CURRENT_TIMESTAMP WHERE walletAddress = ?"
    );
    stmt.run(name, bio, walletAddress);
    return getCreator(walletAddress);
  } else {
    // Insert new creator
    const stmt = db.prepare(
      "INSERT INTO creators (walletAddress, name, bio) VALUES (?, ?, ?)"
    );
    stmt.run(walletAddress, name, bio);
    return getCreator(walletAddress);
  }
}

// Close database connection on process exit
process.on("exit", () => {
  db.close();
});

export default db;
