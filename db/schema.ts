import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'margin-snap.db';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync(DATABASE_NAME);
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(database: SQLite.SQLiteDatabase): void {
  database.execSync(`
    -- Enable foreign keys
    PRAGMA foreign_keys = ON;

    -- Create books table
    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      author TEXT,
      cover_uri TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    -- Create notes table
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL,
      photo_uri TEXT,
      page_number INTEGER,
      memo TEXT,
      emotion_stamp TEXT,
      book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      CHECK (photo_uri IS NOT NULL OR page_number IS NOT NULL)
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_notes_book_id ON notes(book_id);
    CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at);
    CREATE INDEX IF NOT EXISTS idx_books_updated_at ON books(updated_at);
  `);
}

export function closeDatabase(): void {
  if (db) {
    db.closeSync();
    db = null;
  }
}
