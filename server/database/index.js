import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Create a data directory if it doesn't exist
const dataDir = join(__dirname, 'data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

// Define single database path
const dbPath = join(dataDir, 'database.sqlite');
let db;

export async function getDatabase() {
  if (!db) {
    try {
      console.log('Opening database at:', dbPath);
      
      db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });

      // Enable foreign keys and WAL mode for better performance
      await db.exec('PRAGMA foreign_keys = ON');
      await db.exec('PRAGMA journal_mode = WAL');
      await db.exec('PRAGMA synchronous = NORMAL');
      await db.exec('PRAGMA temp_store = MEMORY');
      await db.exec('PRAGMA cache_size = -2000'); // Use up to 2MB of memory for cache
      await db.exec('PRAGMA busy_timeout = 5000'); // Wait up to 5 seconds on busy connections
      await db.exec('PRAGMA page_size = 4096'); // Optimal page size for most systems
      
      // Initialize database schema
      await initializeDatabase(db);
      
      console.log('Database connection established successfully');
    } catch (error) {
      console.error('Database connection error:', error);
      db = null; // Reset db on error
      throw error;
    }
  }
  return db;
}

export async function initializeDatabase(database) {
  const db = database;
  
  try {
    console.log('Starting database initialization...');
    
    // Wrap all table creation in a transaction
    await db.exec('BEGIN TRANSACTION');

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
    console.log('Users table initialized');

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
    console.log('Content table initialized');

    // Tags table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL
      )
    `);
    console.log('Tags table initialized');

    // Content_Tags relationship table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS content_tags (
        content_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (content_id, tag_id),
        FOREIGN KEY (content_id) REFERENCES content (id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
      )
    `);
    console.log('Content_tags table initialized');

    // Content interactions table with user_id
    await db.exec(`
      CREATE TABLE IF NOT EXISTS content_interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content_id INTEGER NOT NULL,
        user_id INTEGER,
        fingerprint TEXT NOT NULL,
        action TEXT NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (content_id) REFERENCES content (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
    console.log('Content_interactions table initialized');

    // Settings table for storing application settings
    await db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Settings table initialized');

    // Create indexes for better performance
    await db.exec(`
      CREATE INDEX IF NOT EXISTS idx_content_status ON content(status);
      CREATE INDEX IF NOT EXISTS idx_content_author ON content(author_id);
      CREATE INDEX IF NOT EXISTS idx_content_tags ON content_tags(content_id, tag_id);
      CREATE INDEX IF NOT EXISTS idx_interactions_content ON content_interactions(content_id);
      CREATE INDEX IF NOT EXISTS idx_interactions_fingerprint ON content_interactions(fingerprint);
      CREATE INDEX IF NOT EXISTS idx_interactions_user ON content_interactions(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
    `);
    console.log('Indexes created');

    await db.exec('COMMIT');
    console.log('Database schema initialized successfully');
  } catch (error) {
    await db.exec('ROLLBACK');
    console.error('Database initialization error:', error);
    throw error;
  }
}