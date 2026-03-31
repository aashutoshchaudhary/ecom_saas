import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler, requestLogger } from '@siteforge/shared';
import { router } from './routes/email.routes';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(requestLogger);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'email-service', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/v1/emails', router);

// Error handling
app.use(errorHandler);

export default app;
