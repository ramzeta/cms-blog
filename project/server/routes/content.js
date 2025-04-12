import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/index.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all content with optional filters
router.get('/', async (req, res) => {
  try {
    const db = await getDatabase();
    const { status, tag, author } = req.query;

    let query = `
      SELECT 
        c.*,
        u.name as author_name,
        GROUP_CONCAT(t.name) as tags
      FROM content c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN content_tags ct ON c.id = ct.content_id
      LEFT JOIN tags t ON ct.tag_id = t.id
    `;

    const whereConditions = [];
    const params = [];

    if (status) {
      whereConditions.push('c.status = ?');
      params.push(status);
    }

    if (author) {
      whereConditions.push('c.author_id = ?');
      params.push(author);
    }

    if (tag) {
      whereConditions.push('t.name = ?');
      params.push(tag);
    }

    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }

    query += ' GROUP BY c.id ORDER BY c.created_at DESC';

    const content = await db.all(query, params);

    // Parse tags string into array
    content.forEach(item => {
      item.tags = item.tags ? item.tags.split(',') : [];
    });

    res.json(content);
  } catch (err) {
    console.error('Error fetching content:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single content by ID
router.get('/:id', async (req, res) => {
  try {
    const db = await getDatabase();
    const content = await db.get(`
      SELECT 
        c.*,
        u.name as author_name,
        GROUP_CONCAT(t.name) as tags
      FROM content c
      LEFT JOIN users u ON c.author_id = u.id
      LEFT JOIN content_tags ct ON c.id = ct.content_id
      LEFT JOIN tags t ON ct.tag_id = t.id
      WHERE c.id = ?
      GROUP BY c.id
    `, [req.params.id]);

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    content.tags = content.tags ? content.tags.split(',') : [];
    res.json(content);
  } catch (err) {
    console.error('Error fetching content:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new content
router.post('/', [
  authenticateToken,
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('body').notEmpty().withMessage('Content body is required'),
  body('status').isIn(['draft', 'published']).withMessage('Invalid status'),
  body('template').notEmpty().withMessage('Template is required'),
  body('tags').isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = await getDatabase();
    const { title, body, status, template, featured_image, tags } = req.body;

    await db.run('BEGIN TRANSACTION');

    try {
      // Insert content
      const result = await db.run(
        `INSERT INTO content (
          title, body, status, author_id, template, 
          featured_image, publish_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          body,
          status,
          req.user.id,
          template,
          featured_image || null,
          status === 'published' ? new Date().toISOString() : null
        ]
      );

      // Handle tags
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          // Insert or get tag
          let tag = await db.get('SELECT id FROM tags WHERE name = ?', [tagName.toLowerCase()]);
          
          if (!tag) {
            const tagResult = await db.run('INSERT INTO tags (name) VALUES (?)', [tagName.toLowerCase()]);
            tag = { id: tagResult.lastID };
          }

          // Create content-tag relationship
          await db.run(
            'INSERT INTO content_tags (content_id, tag_id) VALUES (?, ?)',
            [result.lastID, tag.id]
          );
        }
      }

      await db.run('COMMIT');

      // Fetch the created content with all relations
      const newContent = await db.get(`
        SELECT 
          c.*,
          u.name as author_name,
          GROUP_CONCAT(t.name) as tags
        FROM content c
        LEFT JOIN users u ON c.author_id = u.id
        LEFT JOIN content_tags ct ON c.id = ct.content_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE c.id = ?
        GROUP BY c.id
      `, [result.lastID]);

      newContent.tags = newContent.tags ? newContent.tags.split(',') : [];
      res.status(201).json(newContent);
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error creating content:', err);
    res.status(500).json({ message: 'Failed to create content' });
  }
});

// Update content
router.put('/:id', [
  authenticateToken,
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('body').optional().notEmpty().withMessage('Content body cannot be empty'),
  body('status').optional().isIn(['draft', 'published']).withMessage('Invalid status'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = await getDatabase();
    const contentId = req.params.id;

    // Check if content exists and user has permission
    const existingContent = await db.get(
      'SELECT author_id FROM content WHERE id = ?',
      [contentId]
    );

    if (!existingContent) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Only allow authors or admins to update
    if (existingContent.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await db.run('BEGIN TRANSACTION');

    try {
      const { title, body, status, template, featured_image, tags } = req.body;
      const updates = [];
      const values = [];

      if (title) {
        updates.push('title = ?');
        values.push(title);
      }

      if (body) {
        updates.push('body = ?');
        values.push(body);
      }

      if (status) {
        updates.push('status = ?');
        values.push(status);
        if (status === 'published') {
          updates.push('publish_date = ?');
          values.push(new Date().toISOString());
        }
      }

      if (template) {
        updates.push('template = ?');
        values.push(template);
      }

      if (featured_image !== undefined) {
        updates.push('featured_image = ?');
        values.push(featured_image);
      }

      updates.push('updated_at = CURRENT_TIMESTAMP');

      if (updates.length > 0) {
        values.push(contentId);
        await db.run(
          `UPDATE content SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      // Update tags if provided
      if (tags) {
        // Remove existing tags
        await db.run('DELETE FROM content_tags WHERE content_id = ?', [contentId]);

        // Add new tags
        for (const tagName of tags) {
          let tag = await db.get('SELECT id FROM tags WHERE name = ?', [tagName.toLowerCase()]);
          
          if (!tag) {
            const tagResult = await db.run('INSERT INTO tags (name) VALUES (?)', [tagName.toLowerCase()]);
            tag = { id: tagResult.lastID };
          }

          await db.run(
            'INSERT INTO content_tags (content_id, tag_id) VALUES (?, ?)',
            [contentId, tag.id]
          );
        }
      }

      await db.run('COMMIT');

      // Fetch updated content
      const updatedContent = await db.get(`
        SELECT 
          c.*,
          u.name as author_name,
          GROUP_CONCAT(t.name) as tags
        FROM content c
        LEFT JOIN users u ON c.author_id = u.id
        LEFT JOIN content_tags ct ON c.id = ct.content_id
        LEFT JOIN tags t ON ct.tag_id = t.id
        WHERE c.id = ?
        GROUP BY c.id
      `, [contentId]);

      updatedContent.tags = updatedContent.tags ? updatedContent.tags.split(',') : [];
      res.json(updatedContent);
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error updating content:', err);
    res.status(500).json({ message: 'Failed to update content' });
  }
});

// Delete content
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const contentId = req.params.id;

    // Check if content exists and user has permission
    const content = await db.get(
      'SELECT author_id FROM content WHERE id = ?',
      [contentId]
    );

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Only allow authors or admins to delete
    if (content.author_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Permission denied' });
    }

    await db.run('BEGIN TRANSACTION');

    try {
      // Delete content tags
      await db.run('DELETE FROM content_tags WHERE content_id = ?', [contentId]);
      
      // Delete content
      await db.run('DELETE FROM content WHERE id = ?', [contentId]);

      await db.run('COMMIT');
      res.json({ message: 'Content deleted successfully' });
    } catch (err) {
      await db.run('ROLLBACK');
      throw err;
    }
  } catch (err) {
    console.error('Error deleting content:', err);
    res.status(500).json({ message: 'Failed to delete content' });
  }
});

export default router;