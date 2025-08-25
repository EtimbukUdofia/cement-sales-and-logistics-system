import express, { type Response, type Request } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import connectDB from './db/connectDB.js';
import authRotes from './routes/auth.route.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get('/', (_req: Request, res: Response) => { 
  res.send('API is running...');
});

app.use('/api/v0/auth', authRotes);

app.get('/api/v0/ping', (_req: Request, res: Response) => { 
  res.json({ message: 'pong' });
});

app.get('/api/v0/health', (_req: Request, res: Response) => { 
  res.json({ status: 'ok', timestamp: new Date().toISOString() });  
});

app.get('*', (_req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// global error handler
app.use((err: Error, _req: Request, res: Response, _next: Function) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});