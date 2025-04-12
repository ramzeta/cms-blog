import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initializeDatabase } from './database/index.js';
import { createAdminUser } from './scripts/createAdmin.js';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';
import usersRoutes from './routes/users.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/users', usersRoutes);

// Initialize database and create admin user
async function initialize() {
  try {
    await initializeDatabase();
    console.log('Database initialized');
    await createAdminUser();
  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
}

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Modern CMS API is running' });
});

// Start server with port fallback
const startServer = (port) => {
  try {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${port} is busy, trying ${port + 1}`);
        startServer(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

// Initialize and start server
initialize().then(() => {
  startServer(PORT);
});