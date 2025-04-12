import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { getDatabase } from '../database/index.js';

const router = express.Router();

// Get OpenAI API key status
router.get('/openai-key', authenticateToken, async (req, res) => {
  try {
    const db = await getDatabase();
    const setting = await db.get('SELECT value FROM settings WHERE key = ?', ['openai_api_key']);
    
    res.json({ 
      hasKey: !!setting?.value,
      message: setting?.value ? 'API key is configured' : 'No API key set'
    });
  } catch (error) {
    console.error('Error checking API key:', error);
    res.status(500).json({ 
      error: 'Failed to check API key status',
      message: error.message 
    });
  }
});

// Save OpenAI API key
router.post('/openai-key', authenticateToken, async (req, res) => {
  try {
    const { apiKey } = req.body;
    if (!apiKey) {
      return res.status(400).json({ 
        error: 'API key is required' 
      });
    }

    const db = await getDatabase();
    
    // Use REPLACE to handle both insert and update
    await db.run(
      'REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)',
      ['openai_api_key', apiKey]
    );

    // Update environment variable
    process.env.OPENAI_API_KEY = apiKey;

    res.json({ 
      message: 'API key saved successfully' 
    });
  } catch (error) {
    console.error('Error saving API key:', error);
    res.status(500).json({ 
      error: 'Failed to save API key',
      message: error.message 
    });
  }
});

export default router;