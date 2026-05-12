import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';

// Auto-fix missing src directory if user extracted files incorrectly
const localSrcDir = path.join(process.cwd(), 'src');
const parentSrcDir = path.join(process.cwd(), '..', 'src');

if (!fs.existsSync(localSrcDir) && fs.existsSync(parentSrcDir)) {
  console.log("Auto-fixing missing src directory...");
  fs.cpSync(parentSrcDir, localSrcDir, { recursive: true });
  console.log("Copied src directory successfully! Starting server...");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Supabase proxy routes API
  // We can add the Supabase initialization here
  // The variables were saved in the source code as requested by the user, but on the server side so they are not exposed to the client bundle.
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://elzwayftpjxarbjzvtfu.supabase.co';
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsendheWZ0cGp4YXJianp2dGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg1MzM2MDgsImV4cCI6MjA5NDEwOTYwOH0.ecdsyRHxakagyYUS0ocELOobUGXzqGHTZmEE-Jv3rKk';

  // API routes FIRST
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
  });

  // Example API route for supabase if we ever need it.
  app.get('/api/supabase-status', (req, res) => {
    // Only return success to not expose the key
    res.json({ status: 'configured', url: SUPABASE_URL });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
