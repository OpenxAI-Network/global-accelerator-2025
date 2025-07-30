import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import { createServer } from "http"
import { Server as SocketIOServer } from "socket.io"
import dotenv from "dotenv"

// Import routes
import authRoutes from "./routes/auth"
import portfolioRoutes from "./routes/portfolio"
import aiRoutes from "./routes/ai"
import fraudRoutes from "./routes/fraud"
import marketRoutes from "./routes/market"
import memoryVaultRoutes from "./routes/memoryVault"
import defiPoolsRoutes from "./routes/defiPools"
import tradingBotRoutes from "./routes/tradingBot"

// Import middleware
import { errorHandler } from "./middleware/errorHandler"
import { rateLimiter } from "./middleware/rateLimiter"
import { authenticateToken } from "./middleware/auth"

// Import services
import { DatabaseService } from "./services/database"
import { RedisService } from "./services/redis"
import { ArweaveService } from "./services/arweave"
import { WebSocketService } from "./services/websocket"
import { CronService } from "./services/cron"
import { logger } from "./utils/logger"

dotenv.config()

const app = express()
const server = createServer(app)
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
  },
})

const PORT = process.env.PORT || 4000

// Initialize services
const dbService = new DatabaseService()
const redisService = new RedisService()
const arweaveService = new ArweaveService()
const wsService = new WebSocketService(io)
const cronService = new CronService()

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }),
)

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
)

app.use(compression())
app.use(morgan("combined"))
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting
app.use("/api/", rateLimiter)

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "1.0.0",
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/portfolio", authenticateToken, portfolioRoutes)
app.use("/api/ai", authenticateToken, aiRoutes)
app.use("/api/fraud", authenticateToken, fraudRoutes)
app.use("/api/market", authenticateToken, marketRoutes)
app.use("/api/memory-vault", authenticateToken, memoryVaultRoutes)
app.use("/api/defi-pools", authenticateToken, defiPoolsRoutes)
app.use("/api/trading-bot", authenticateToken, tradingBotRoutes)

// WebSocket connection handling
io.on("connection", (socket) => {
  logger.info(`Client connected: ${socket.id}`)

  socket.on("join-room", (walletAddress: string) => {
    socket.join(`user-${walletAddress}`)
    logger.info(`User ${walletAddress} joined room`)
  })

  socket.on("disconnect", () => {
    logger.info(`Client disconnected: ${socket.id}`)
  })
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method,
  })
})

// Graceful shutdown
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down gracefully")

  server.close(() => {
    logger.info("HTTP server closed")
  })

  await dbService.close()
  await redisService.close()
  cronService.stop()

  process.exit(0)
})

// Start server
async function startServer() {
  try {
    // Initialize database
    await dbService.initialize()
    logger.info("Database connected")

    // Initialize Redis
    await redisService.initialize()
    logger.info("Redis connected")

    // Initialize Arweave
    await arweaveService.initialize()
    logger.info("Arweave initialized")

    // Start cron jobs
    cronService.start()
    logger.info("Cron jobs started")

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 PsyFi Backend Server running on port ${PORT}`)
      logger.info(`📊 Health check: http://localhost:${PORT}/health`)
      logger.info(`🔗 WebSocket server ready`)
    })
  } catch (error) {
    logger.error("Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

export { app, io }
