# Modern CMS Server

This is the backend server for the Modern CMS application. It's built with Express.js and uses SQLite for data storage.

## Structure

```
server/
├── database/         # Database configuration and migrations
├── middleware/       # Express middleware
├── routes/          # API routes
├── .env             # Environment variables
├── index.js         # Server entry point
└── package.json     # Server dependencies
```

## Running the Server

The server can be run independently using:

```bash
cd server
npm install
npm run dev
```

Or as part of the main application using:

```bash
npm run dev
```

from the root directory.