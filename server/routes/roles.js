import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/index.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all roles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const roles = await db.all('SELECT * FROM roles');
    res.json(roles);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create role
router.post('/', [
  authenticateToken,
  authorizeRole(['admin']),
  body('name').notEmpty(),
  body('permissions').isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const db = await getDatabase();
    const { name, permissions } = req.body;

    const result = await db.run(
      'INSERT INTO roles (name, permissions) VALUES (?, ?)',
      [name, JSON.stringify(permissions)]
    );

    res.status(201).json({
      id: result.lastID,
      name,
      permissions
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;