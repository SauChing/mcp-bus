import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Import and mount /api handlers
app.get('/api/health', async (req, res) => {
  try {
    const healthHandler = (await import('./api/health.js')).default;
    return healthHandler(req, res);
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

app.all('/api/bus-arrival', async (req, res) => {
  try {
    const busArrivalHandler = (await import('./api/bus-arrival.js')).default;
    return busArrivalHandler(req, res);
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// Setup Vite middlewares in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`PulseTransit full-stack server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
