import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/index.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all templates
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const templates = await db.all('SELECT * FROM templates');
    res.json(templates);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create template
router.post('/', [
  authenticateToken,
  authorizeRole(['admin']),
  body('name').notEmpty(),
  body('description').notEmpty(),
  body('fields').isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = await getDatabase();
    const { name, description, fields } = req.body;

    const result = await db.run(
      'INSERT INTO templates (name, description, fields) VALUES (?, ?, ?)',
      [name, description, JSON.stringify(fields)]
    );

    res.status(201).json({
      id: result.lastID,
      name,
      description,
      fields
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;