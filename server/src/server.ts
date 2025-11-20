import express, { type Request, type Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
// import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';


import connectDB from './db/connectDB.js';
import authRotes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import shopRoutes from './routes/shop.route.js';
import productRoutes from './routes/product.route.js';
import customerRoutes from './routes/customer.route.js';
import inventoryRoutes from './routes/inventory.route.js';
import salesOrderRoutes from './routes/salesOrder.route.js';
import supplierRoutes from './routes/supplier.route.js';
import purchaseOrderRoutes from './routes/purchaseOrder.route.js';
import reportRoutes from './routes/report.route.js';
// import { verifyToken } from './middlewares/verifyToken.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Production security and performance middleware
if (process.env.NODE_ENV === 'production') {

  // Render proxy configuration
  // app.set('trust proxy', 3);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", process.env.API_URL || "'self'", "https:", "wss:"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-eval'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));

  // Compression
  app.use(compression());

  // Request logging
  app.use(morgan('combined'));

  // Rate limiting
  // const limiter = rateLimit({
  //   windowMs: 15 * 60 * 1000, // 15 minutes
  //   max: 100, // Limit each IP to 100 requests per windowMs
  //   message: 'Too many requests from this IP, please try again later.',
  //   standardHeaders: true,
  //   legacyHeaders: false,
  // });
  // app.use('/api', limiter);

  // Stricter rate limiting for auth endpoints
  // const authLimiter = rateLimit({
  //   windowMs: 15 * 60 * 1000, // 15 minutes
  //   max: 10, // Limit each IP to 10 auth requests per windowMs
  //   message: 'Too many authentication attempts, please try again later.',
  // });
  // app.use('/api/v0/auth', authLimiter);
} else {
  // Development logging
  app.use(morgan('dev'));
}

// Disable 'X-Powered-By' header for security
app.disable('x-powered-by');

// Enhanced CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? [process.env.CORS_ORIGIN || process.env.CLIENT_URL || 'http://localhost:5000'].filter(Boolean)
    : process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
}

// app.use(cors(corsOptions));
// app.use(cors({origin:true, credentials:true}));
app.use(cors({ origin: true, credentials: true })); // Allow all origins for testing; restrict in production

// Enhanced cookie parser with security options for production
if (process.env.NODE_ENV === 'production') {
  app.use(cookieParser(process.env.JWT_SECRET));
} else {
  app.use(cookieParser());
}

app.use(express.json({ limit: '10mb' })); // Add request size limit for security

app.get('/api/v0/ping', (_req: Request, res: Response) => {
  res.json({ message: 'pong' });
});

app.get('/api/v0/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/v0/auth', authRotes);

// app.use(verifyToken);
app.use('/api/v0/users', userRoutes);
app.use('/api/v0/customers', customerRoutes);
app.use('/api/v0/suppliers', supplierRoutes);
app.use('/api/v0/shops', shopRoutes);
app.use('/api/v0/products', productRoutes);
app.use('/api/v0/inventory', inventoryRoutes);
app.use('/api/v0/purchase-orders', purchaseOrderRoutes);
app.use('/api/v0/sales-orders', salesOrderRoutes);
// app.use('/api/v0/invoices', require('./routes/invoice.route.js').default);
// app.use('/api/v0/trucks', require('./routes/truck.route.js').default);
// app.use('/api/v0/routes', require('./routes/route.route.js').default);
// app.use('/api/v0/deliveries', require('./routes/delivery.route.js').default);
app.use('/api/v0/reports', reportRoutes);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  console.log(process.env.NODE_ENV);
  const clientDistPath = path.resolve(__dirname, '..', '..', 'client', 'dist');
  console.log('Client dist path resolved to:', clientDistPath);
  console.log('__dirname is:', __dirname);
  app.use(express.static(clientDistPath));

  // Catch-all handler: send back React's index.html file for any non-API routes
  app.get(/(.*)/, (_req: Request, res: Response) => {
    const indexPath = path.join(clientDistPath, 'index.html');
    console.log('Trying to serve index.html from:', indexPath);
    res.sendFile(indexPath);
  });
} else {
  // Development 404 handler for API routes only
  app.get('/api/*', (_req: Request, res: Response) => {
    res.status(404).json({ message: 'API route not found' });
  });
}

// global error handler
app.use((err: Error, _req: Request, res: Response, _next: Function) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});