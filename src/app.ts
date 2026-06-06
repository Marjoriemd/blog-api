import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { env } from './config/env';
import authRoutes from './routes/auth.routes';
import feedRoutes from './routes/feed.routes';
import { errorHandler, notFound } from './middlewares/error.middleware';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/', authRoutes);
app.use('/', feedRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
