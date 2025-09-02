import express, { type Response, type Request } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import connectDB from './db/connectDB.js';
import authRotes from './routes/auth.route.ts';
import userRoutes from './routes/user.route.ts';
import shopRoutes from './routes/shop.route.ts';
import productRoutes from './routes/product.route.ts';
import customerRoutes from './routes/customer.route.ts';
import inventoryRoutes from './routes/inventory.route.ts';
import salesOrderRoutes from './routes/salesOrder.route.ts';
import { verifyToken } from './middlewares/verifyToken.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());

app.get('/', (_req: Request, res: Response) => { 
  res.send('API is running...');
});

app.use('/api/v0/auth', authRotes);

// protected routes. check if authenticated and role is admin
app.use(verifyToken);
app.use('/api/v0/users', userRoutes);
app.use('/api/v0/customers', customerRoutes);
// app.use('/api/v0/suppliers', require('./routes/supplier.route.ts').default);
app.use('/api/v0/shops',shopRoutes);
app.use('/api/v0/products', productRoutes);
app.use('/api/v0/inventory', inventoryRoutes);
// app.use('/api/v0/purchase-orders', require('./routes/purchaseOrder.route.ts').default);
app.use('/api/v0/sales-orders', salesOrderRoutes);
// app.use('/api/v0/invoices', require('./routes/invoice.route.ts').default);
// app.use('/api/v0/trucks', require('./routes/truck.route.ts').default);
// app.use('/api/v0/routes', require('./routes/route.route.ts').default);
// app.use('/api/v0/deliveries', require('./routes/delivery.route.ts').default);
// app.use('/api/v0/reports', require('./routes/report.route.ts').default);

app.get('/api/v0/ping', (_req: Request, res: Response) => { 
  res.json({ message: 'pong' });
});

app.get('/api/v0/health', (_req: Request, res: Response) => { 
  res.json({ status: 'ok', timestamp: new Date().toISOString() });  
});

app.get(/(.*)/, (_req: Request, res: Response) => {
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