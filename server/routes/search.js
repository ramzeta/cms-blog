import express from 'express';
import { getDatabase } from '../database/index.js';
import OpenAI from 'openai';
import fetch from 'node-fetch';

const router = express.Router();

// Function to search existing content
async function searchContent(query) {
  const db = await getDatabase();
  const searchTerm = `%${query}%`;
  
  return db.all(`
    SELECT 
      c.*,
      u.name as author_name,
      GROUP_CONCAT(t.name) as tags
    FROM content c
    LEFT JOIN users u ON c.author_id = u.id
    LEFT JOIN content_tags ct ON c.id = ct.content_id
    LEFT JOIN tags t ON ct.tag_id = t.id
    WHERE c.status = 'published' 
    AND (
      c.title LIKE ? 
      OR c.body LIKE ?
      OR t.name LIKE ?
    )
    GROUP BY c.id
  `, [searchTerm, searchTerm, searchTerm]);
}

// Function to generate content with OpenAI
async function generateWithOpenAI(query) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are a knowledgeable blog writer. Create a detailed, well-structured article about the given topic."
      },
      {
        role: "user",
        content: `Write a blog post about: ${query}`
      }
    ],
    temperature: 0.7,
    max_tokens: 1000
  });

  return {
    title: query,
    body: response.choices[0].message.content,
    generated: true,
    source: 'openai'
  };
}

// Function to generate content with Ollama
async function generateWithOllama(query) {
  try {
    const response = await fetch(`${process.env.OLLAMA_URL || 'http://localhost:11434'}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral',
        prompt: `Write a detailed blog post about: ${query}`,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error('Ollama API request failed');
    }

    const data = await response.json();
    return {
      title: query,
      body: data.response,
      generated: true,
      source: 'ollama'
    };
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama server is not running. Please start the Ollama server or switch to OpenAI.');
    }
    throw new Error(`Ollama generation failed: ${error.message}`);
  }
}

// Search endpoint
router.get('/', async (req, res) => {
  try {
    const { q: query, generate = 'false', ai = 'ollama' } = req.query;

    if (!query) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // First, search existing content
    const results = await searchContent(query);

    if (results.length > 0) {
      return res.json({
        results,
        generated: false
      });
    }

    // If no results and generation is requested
    if (generate === 'true') {
      try {
        let generatedContent;
        if (ai === 'openai' && process.env.OPENAI_API_KEY) {
          generatedContent = await generateWithOpenAI(query);
        } else {
          generatedContent = await generateWithOllama(query);
        }
        
        return res.json({
          results: [generatedContent],
          generated: true
        });
      } catch (error) {
        console.error('AI generation error:', error);
        return res.status(500).json({ 
          message: error.message || 'Failed to generate content'
        });
      }
    }

    // No results and no generation requested
    return res.json({
      results: [],
      generated: false
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ 
      message: error.message || 'Server error during search'
    });
  }
});

export default router;