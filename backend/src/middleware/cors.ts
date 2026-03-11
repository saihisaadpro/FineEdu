import cors from 'cors';
import { config } from '../config.js';

export const corsMiddleware = cors({
  origin: config.ALLOWED_ORIGINS.split(',').map(o => o.trim()),
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  maxAge: 86400,
});
