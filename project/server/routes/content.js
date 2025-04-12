import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/index.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all content
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const content = await db.all(`
      SELECT c.*, u.name as author_name, GROUP_CONCAT(t.name) as tags
      FROM content c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN content_tags ct ON c.id = ct.content_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      WHERE c.status = 'published'
      GROUP BY c.id
    `);
    res.json(content);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new content
router.post('/', [
  body('title').notEmpty(),
  body('body').notEmpty(),
  authenticateToken
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = await getDatabase();
    const { title, body, status, template, featured_image, tags } = req.body;

    // Start transaction
    await db.run('BEGIN TRANSACTION');

    // Insert content
    const contentResult = await db.run(
      `INSERT INTO content (title, body, status, author_id, template, featured_image)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, body, status || 'draft', req.user.id, template || 'article', featured_image]
    );

    // Handle tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Insert or get tag
        let tagResult = await db.get('SELECT id FROM tags WHERE name = ?', [tagName]);
        if (!tagResult) {
          tagResult = await db.run('INSERT INTO tags (name) VALUES (?)', [tagName]);
        }

        // Create content-tag relationship
        await db.run(
          'INSERT INTO content_tags (content_id, tag_id) VALUES (?, ?)',
          [contentResult.lastID, tagResult.id || tagResult.lastID]
        );
      }
    }

    await db.run('COMMIT');

    const newContent = await db.get(
      `SELECT c.*, u.name as author_name, GROUP_CONCAT(t.name) as tags
       FROM content c
       LEFT JOIN users u ON c.author_id = u.id
       LEFT JOIN content_tags ct ON c.id = ct.content_id
       LEFT JOIN tags t ON ct.tag_id = t.id
       WHERE c.id = ?
       GROUP BY c.id`,
      [contentResult.lastID]
    );

    res.status(201).json(newContent);
  } catch (err) {
    await db.run('ROLLBACK');
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;