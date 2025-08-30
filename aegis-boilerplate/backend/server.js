import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import routes
import portfolioRoutes from './routes/portfolio.js';
import aiRoutes from './routes/ai.js';
import notificationRoutes from './routes/notifications.js';
import translationRoutes from './routes/translations.js';

// Import services
import { WebSocketService } from './services/websocket.js';
import { NotificationService } from './services/notifications.js';
import { PortfolioService } from './services/portfolio.js';
import { AIService } from './services/ai.js';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// =============================================================================
// MIDDLEWARE
// =============================================================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "ws:", "wss:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',') : 
    ['http://localhost:3000', 'http://localhost:4173', 'https://aegis.ai'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// =============================================================================
// SERVICES INITIALIZATION
// =============================================================================

// Initialize WebSocket service
const wsService = new WebSocketService(wss);

// Initialize other services
const notificationService = new NotificationService();
const portfolioService = new PortfolioService();
const aiService = new AIService();

// Make services available to routes
app.locals.services = {
  ws: wsService,
  notifications: notificationService,
  portfolio: portfolioService,
  ai: aiService,
};

// =============================================================================
// ROUTES
// =============================================================================

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    services: {
      websocket: wsService.isHealthy(),
      notifications: notificationService.isHealthy(),
      portfolio: portfolioService.isHealthy(),
      ai: aiService.isHealthy(),
    }
  });
});

// API routes
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/translations', translationRoutes);

// =============================================================================
// ERROR HANDLING MIDDLEWARE
// =============================================================================

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  // Don't leak error details in production
  const error = NODE_ENV === 'development' ? err : {};
  
  res.status(status).json({
    error: {
      message,
      status,
      timestamp: new Date().toISOString(),
      ...(NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// =============================================================================
// WEBSOCKET EVENT HANDLERS
// =============================================================================

wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection:', req.socket.remoteAddress);
  
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
          break;
          
        case 'subscribe_portfolio':
          wsService.subscribeToPortfolio(ws, message.userId);
          break;
          
        case 'subscribe_notifications':
          wsService.subscribeToNotifications(ws, message.userId);
          break;
          
        case 'refresh_positions':
          // Trigger portfolio refresh
          const positions = await portfolioService.getPositions(message.userId);
          ws.send(JSON.stringify({
            type: 'portfolio_update',
            positions,
            timestamp: Date.now()
          }));
          break;
          
        default:
          console.log('Unknown WebSocket message type:', message.type);
      }
    } catch (err) {
      console.error('WebSocket message error:', err);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format',
        timestamp: Date.now()
      }));
    }
  });
  
  ws.on('close', () => {
    console.log('WebSocket connection closed');
    wsService.removeConnection(ws);
  });
  
  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
    wsService.removeConnection(ws);
  });
});

// =============================================================================
// GRACEFUL SHUTDOWN
// =============================================================================

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  
  // Close WebSocket server
  wss.close(() => {
    console.log('WebSocket server closed');
  });
  
  // Close HTTP server
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.emit('SIGTERM');
});

// =============================================================================
// START SERVER
// =============================================================================

server.listen(PORT, () => {
  console.log(`🚀 Aegis Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${NODE_ENV}`);
  console.log(`🔌 WebSocket server ready`);
  console.log(`📡 Health check available at /health`);
});

export default app;
