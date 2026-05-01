import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';

// Load environment variables
dotenv.config();

const app: Application = express();

// ── Middlewares ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: 'http://localhost:5173', // Vite default dev port
  credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // 10mb limit for base64 profile pictures
app.use(express.urlencoded({ extended: true }));

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.send('AccessHub API is running...');
});

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api', routes);

// ── Error Handler (must be last) ──────────────────────────────────────────────
app.use(errorHandler);

export default app;
