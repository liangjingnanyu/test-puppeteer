import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Routers
import puppeteerRouter from './routes/puppeteer.js';
import searchRouter from './routes/search.js';

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// static assets (public/)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.resolve(__dirname, '../public')));

// Mount routers under /api
app.use('/api', puppeteerRouter);
app.use('/api', searchRouter);

export default app;
