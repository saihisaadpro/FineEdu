import express from 'express';
import helmet from 'helmet';
import { config } from './config.js';
import { logger } from './logger.js';
import { corsMiddleware } from './middleware/cors.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import generateRouter from './routes/generate.js';
import evaluateRouter from './routes/evaluate.js';
import chatRouter from './routes/chat.js';
import bridgeRouter from './routes/bridge.js';

const app = express();

app.use(helmet());
app.use(corsMiddleware);
app.use(globalRateLimiter);
app.use(express.json({ limit: '16kb' }));

// Health check for Cloud Run
app.get('/health', (_req, res) => res.json({ status: 'ok', version: '0.5.0' }));

app.use('/api/generate', generateRouter);
app.use('/api/evaluate', evaluateRouter);
app.use('/api/chat', chatRouter);
app.use('/api/bridge', bridgeRouter);

app.use(errorHandler);

app.listen(config.PORT, () => {
  logger.info({ port: config.PORT, env: config.NODE_ENV }, 'WorkReady Finance backend started');
});
