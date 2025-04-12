import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/index.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const db = await getDatabase();
    const users = await db.all('SELECT id, name, email, role, created_at FROM users');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new user (admin only)
router.post('/', [
  authenticateToken,
  authorizeRole(['admin']),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').trim().isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'editor', 'user']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = await getDatabase();
    const { name, email, password, role } = req.body;

    // Check if email already exists
    const existingUser = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await db.run(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    const newUser = await db.get(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [result.lastID]
    );

    res.status(201).json(newUser);
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', [
  authenticateToken,
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().trim().isEmail().withMessage('Valid email is required'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'editor', 'user']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = await getDatabase();
    const { name, email, password, role } = req.body;
    const userId = req.params.id;

    // Check if user exists
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only admins can update other users or change roles
    if (req.user.role !== 'admin' && (req.user.id !== userId || role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = 'UPDATE users SET updated_at = CURRENT_TIMESTAMP';
    const values = [];

    if (name) {
      query += ', name = ?';
      values.push(name);
    }

    if (email && email !== user.email) {
      // Check if new email already exists
      const existingUser = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      query += ', email = ?';
      values.push(email);
    }

    if (password) {
      query += ', password = ?';
      values.push(await bcrypt.hash(password, 10));
    }

    if (role && req.user.role === 'admin') {
      query += ', role = ?';
      values.push(role);
    }

    query += ' WHERE id = ?';
    values.push(userId);

    await db.run(query, values);

    const updatedUser = await db.get(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Failed to update user' });
  }
});

// Delete user (admin only)
router.delete('/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
  try {
    const db = await getDatabase();
    const userId = req.params.id;

    // Prevent deleting the last admin
    const adminCount = await db.get('SELECT COUNT(*) as count FROM users WHERE role = ?', ['admin']);
    const userToDelete = await db.get('SELECT role FROM users WHERE id = ?', [userId]);

    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToDelete.role === 'admin' && adminCount.count <= 1) {
      return res.status(400).json({ message: 'Cannot delete the last admin user' });
    }

    // Check if user is trying to delete themselves
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [userId]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

export default router;