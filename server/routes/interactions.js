import express from 'express';
import { body, validationResult } from 'express-validator';
import { getDatabase } from '../database/index.js';
import { authenticateToken } from '../middleware/auth.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Get interactions for a content
router.get('/:contentId', async (req, res) => {
  try {
    const db = await getDatabase();
    const { contentId } = req.params;

    console.log('Fetching interactions for content:', contentId);

    // Get interaction counts
    const interactions = await db.all(`
      SELECT action, COUNT(*) as count
      FROM content_interactions
      WHERE content_id = ?
      GROUP BY action
    `, [contentId]);

    console.log('Fetched interaction counts:', interactions);

    // Get comments with author information
    const comments = await db.all(`
      SELECT 
        ci.id,
        ci.comment,
        ci.created_at,
        ci.fingerprint,
        COALESCE(u.name, 'Anonymous') as author_name,
        ci.user_id
      FROM content_interactions ci
      LEFT JOIN users u ON ci.user_id = u.id
      WHERE ci.content_id = ? AND ci.action = 'comment'
      ORDER BY ci.created_at DESC
    `, [contentId]);

    console.log('Fetched comments:', comments);

    // Check if the current user has liked the content
    let hasLiked = false;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const existingLike = await db.get(`
          SELECT id FROM content_interactions
          WHERE content_id = ? AND user_id = ? AND action = 'like'
        `, [contentId, decoded.id]);
        hasLiked = !!existingLike;
      } catch (err) {
        console.log('Token verification failed:', err);
      }
    }

    res.json({
      interactions: {
        views: interactions.find(i => i.action === 'view')?.count || 0,
        likes: interactions.find(i => i.action === 'like')?.count || 0,
        comments: comments
      },
      liked: hasLiked
    });
  } catch (err) {
    console.error('Error fetching interactions:', err);
    res.status(500).json({
      error: 'Database error',
      message: err.message || 'Failed to fetch interactions'
    });
  }
});

// Record an interaction
router.post('/', [
  body('contentId').notEmpty().withMessage('Content ID is required'),
  body('fingerprint').notEmpty().withMessage('Fingerprint is required'),
  body('action').isIn(['view', 'like', 'comment']).withMessage('Invalid action'),
  body('comment').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const db = await getDatabase();
    const { contentId, fingerprint, action, comment } = req.body;

    // Get user ID if authenticated
    let userId = null;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        console.log('Token verification failed:', err);
      }
    }

    // For views and likes, check if already exists
    if (action === 'view' || action === 'like') {
      const query = userId 
        ? 'SELECT id FROM content_interactions WHERE content_id = ? AND (fingerprint = ? OR user_id = ?) AND action = ?'
        : 'SELECT id FROM content_interactions WHERE content_id = ? AND fingerprint = ? AND action = ?';
      
      const params = userId 
        ? [contentId, fingerprint, userId, action]
        : [contentId, fingerprint, action];

      const existing = await db.get(query, params);

      if (existing) {
        if (action === 'view') {
          return res.json({ message: 'View already recorded' });
        } else {
          // Remove like if it exists
          await db.run('DELETE FROM content_interactions WHERE id = ?', [existing.id]);
          
          const likes = await db.get(`
            SELECT COUNT(*) as count
            FROM content_interactions
            WHERE content_id = ? AND action = 'like'
          `, [contentId]);
          
          return res.json({
            message: 'Like removed',
            liked: false,
            likes: likes.count
          });
        }
      }
    }

    // Record the interaction
    await db.run(`
      INSERT INTO content_interactions (
        content_id, 
        user_id,
        fingerprint, 
        action, 
        comment
      ) VALUES (?, ?, ?, ?, ?)
    `, [contentId, userId, fingerprint, action, comment]);

    // Get updated counts
    const counts = await db.all(`
      SELECT action, COUNT(*) as count
      FROM content_interactions
      WHERE content_id = ?
      GROUP BY action
    `, [contentId]);

    // If this was a comment, get the new comment details
    let newComment = null;
    if (action === 'comment') {
      newComment = await db.get(`
        SELECT 
          ci.id,
          ci.comment,
          ci.created_at,
          ci.fingerprint,
          COALESCE(u.name, 'Anonymous') as author_name,
          ci.user_id
        FROM content_interactions ci
        LEFT JOIN users u ON ci.user_id = u.id
        WHERE ci.content_id = ? AND ci.action = 'comment'
        ORDER BY ci.created_at DESC
        LIMIT 1
      `, [contentId]);
    }

    res.json({
      message: 'Interaction recorded',
      liked: action === 'like' ? true : undefined,
      comment: newComment,
      interactions: {
        views: counts.find(i => i.action === 'view')?.count || 0,
        likes: counts.find(i => i.action === 'like')?.count || 0,
        comments: counts.find(i => i.action === 'comment')?.count || 0
      }
    });
  } catch (err) {
    console.error('Error recording interaction:', err);
    res.status(500).json({
      error: 'Database error',
      message: err.message || 'Failed to record interaction'
    });
  }
});

export default router;