import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, unlinkSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = join(__dirname, 'database.sqlite');

let db;

export async function getDatabase() {
  if (!db) {
    // Always remove the database file if it exists to ensure a clean start
    if (existsSync(dbPath)) {
      try {
        unlinkSync(dbPath);
        console.log('Removed existing database for clean start');
      } catch (error) {
        console.error('Error removing database:', error);
      }
    }

    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await db.run('PRAGMA foreign_keys = ON');
    
    // Initialize the database
    await initializeDatabase();
  }
  return db;
}

export async function initializeDatabase() {
  const db = await getDatabase();
  
  // Users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Content table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      author_id INTEGER NOT NULL,
      template TEXT NOT NULL DEFAULT 'article',
      featured_image TEXT,
      publish_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (author_id) REFERENCES users (id)
    )
  `);

  // Tags table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);

  // Content_Tags relationship table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS content_tags (
      content_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (content_id, tag_id),
      FOREIGN KEY (content_id) REFERENCES content (id),
      FOREIGN KEY (tag_id) REFERENCES tags (id)
    )
  `);

  console.log('Database initialized successfully');
}