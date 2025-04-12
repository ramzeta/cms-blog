import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { getDatabase } from './database/index.js';
import { createAdminUser } from './scripts/createAdmin.js';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import usersRoutes from './routes/users.js';
import rolesRoutes from './routes/roles.js';
import settingsRoutes from './routes/settings.js';
import searchRoutes from './routes/search.js';
import interactionsRoutes from './routes/interactions.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Custom logging format
morgan.token('body', (req) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const sanitizedBody = { ...req.body };
    delete sanitizedBody.password;
    delete sanitizedBody.apiKey;
    return JSON.stringify(sanitizedBody);
  }
  return '';
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan(':method :url :status :response-time ms - :body'));

// Initialize database before setting up routes
async function initializeApp() {
  try {
    console.log('Initializing application...');
    
    // Initialize database and create admin user
    const db = await getDatabase();
    console.log('Database connection established');
    
    await createAdminUser();
    console.log('Admin user checked/created');

    // Routes
    app.use('/auth', authRoutes);
    app.use('/content', contentRoutes);
    app.use('/users', usersRoutes);
    app.use('/roles', rolesRoutes);
    app.use('/settings', settingsRoutes);
    app.use('/search', searchRoutes);
    app.use('/interactions', interactionsRoutes);

    // Basic route
    app.get('/', (req, res) => {
      res.json({ message: 'Modern CMS API is running' });
    });

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({
        error: 'Server error',
        message: err.message
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`\n🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
}

// Start the application
initializeApp();