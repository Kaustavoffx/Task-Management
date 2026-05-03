import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
// import mongoSanitize from 'express-mongo-sanitize'; // Temporarily removed to fix Express 5.x crash
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import authRoutes from './routes/authRoutes';
import taskRoutes from './routes/taskRoutes';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

// Socket Authentication Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    // Assign the user ID to the socket for later reference if needed
    (socket as any).userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

io.on('connection', (socket) => {
  const userId = (socket as any).userId;
  console.log(`Socket connected: ${socket.id} for user: ${userId}`);

  // Join a private room corresponding to the user's ID
  socket.join(userId);

  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Security Middleware
import helmet from 'helmet';

// Inject io instance into express app so controllers can use it
app.set('io', io);

// Middleware
app.use(helmet());

const allowedOrigins = [
  'http://localhost:5173', 
  'https://todo-hazel-psi-95.vercel.app',
  process.env.FRONTEND_URL || 'https://antigravity-tasks.production.app'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(express.json());
// app.use(mongoSanitize()); // Temporarily disabled to avoid "Cannot set property query" error on Express 5

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Centralized Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(`[Error] ${req.method} ${req.url} - ${err.message}`);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 5000;

// Start the server immediately so Render detects port binding
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Connect to MongoDB asynchronously
if (!process.env.MONGO_URI) {
  console.error('[Error] MONGO_URI is undefined in environment variables.');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('MongoDB Connected successfully');
  })
  .catch((err) => {
    console.error('Database connection FATAL error:', err);
    process.exit(1); // Exit with failure code to alert hosting provider
  });
