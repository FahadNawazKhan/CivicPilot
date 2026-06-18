import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config/environment.js';
import { connectDB } from './config/db.js';
import securityHeaders from './middlewares/securityHeaders.js';
import errorHandler from './middlewares/errorHandler.js';
import apiRoutes from './routes/index.js';

const app = express();
const PORT = config.PORT;
const HOST = config.HOST;

const allowedOrigins = ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://localhost:3000'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(cookieParser());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(securityHeaders);

// Lazy-connect database middleware to handle serverless cold starts & cache connections
const dbMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed. Please ensure environment variables are configured.' });
  }
};

app.use('/api', dbMiddleware, apiRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, HOST, () => {
    console.log(`CivicPilot Backend listening securely on http://${HOST}:${PORT}`);
  });
}

export default app;