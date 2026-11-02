import express from 'express';
import cors from 'cors';
import { createApiRouter } from './routes';
import { config } from './config';
import { getProjectStore } from './db';

export function createApp() {
  const app = express();

  // CORS configuration
  app.use(cors({
    origin: config.corsOrigin || (config.isDev ? '*' : false),
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Hub-Signature-256', 'X-GitHub-Delivery', 'X-GitHub-Event'],
  }));

  // JSON Body parser with raw body buffer capture for webhook signature verification
  app.use(express.json({
    limit: '1mb',
    verify: (req: any, _res, buf) => {
      req.rawBody = buf;
    },
  }));

  // Mount API router
  const store = getProjectStore();
  const apiRouter = createApiRouter(store);
  app.use('/api', apiRouter);

  return { app, store };
}

// Start server if executed directly
if (process.env.NODE_ENV !== 'test') {
  const { app, store } = createApp();

  store.init().then(() => {
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 Portfolio Management Server running on http://0.0.0.0:${config.port}`);
      console.log(`📡 GitHub User: ${config.githubUsername}`);
      console.log(`🔐 Admin Endpoint: http://localhost:${config.port}/api/admin/projects`);
      console.log(`🌐 Public Projects: http://localhost:${config.port}/api/projects`);
    });
  }).catch((err) => {
    console.error('Failed to initialize database store:', err);
    process.exitCode = 1;
  });
}
