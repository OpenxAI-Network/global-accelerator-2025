import express from "express"
import jwt from "jsonwebtoken"
import { ethers } from "ethers"
import { DatabaseService } from "../services/database"
import { RedisService } from "../services/redis"
import { logger } from "../utils/logger"
import { validateRequest } from "../middleware/validation"
import Joi from "joi"

const router = express.Router()
const db = new DatabaseService()
const redis = new RedisService()

// Validation schemas
const connectWalletSchema = Joi.object({
  walletAddress: Joi.string()
    .pattern(/^0x[a-fA-F0-9]{40}$/)
    .required(),
  signature: Joi.string().required(),
  message: Joi.string().required(),
  username: Joi.string().min(3).max(50).optional(),
  email: Joi.string().email().optional(),
})

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
})

// Connect wallet endpoint
router.post("/connect", validateRequest(connectWalletSchema), async (req, res) => {
  try {
    const { walletAddress, signature, message, username, email } = req.body

    // Verify the signature
    const recoveredAddress = ethers.verifyMessage(message, signature)

    if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
      return res.status(401).json({
        error: "Invalid signature",
        code: "INVALID_SIGNATURE",
      })
    }

    // Check if message is recent (within 5 minutes)
    const messageTimestamp = extractTimestampFromMessage(message)
    const now = Date.now()
    const fiveMinutes = 5 * 60 * 1000

    if (now - messageTimestamp > fiveMinutes) {
      return res.status(401).json({
        error: "Message expired",
        code: "MESSAGE_EXPIRED",
      })
    }

    // Create or update user
    const user = await db.createUser(walletAddress, username, email)

    // Generate JWT tokens
    const accessToken = jwt.sign(
      {
        userId: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" },
    )

    const refreshToken = jwt.sign({ userId: user.id, walletAddress: user.wallet_address }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    })

    // Store session in database and cache
    const sessionId = generateSessionId()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await db.createSession(sessionId, user.id, user.wallet_address, expiresAt)
    await redis.cacheUserSession(
      sessionId,
      {
        userId: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
      },
      7 * 24 * 60 * 60,
    ) // 7 days in seconds

    logger.info(`User connected: ${walletAddress}`)

    res.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
        email: user.email,
        preferences: user.preferences,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
      sessionId,
    })
  } catch (error) {
    logger.error("Wallet connection error:", error)
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    })
  }
})

// Refresh token endpoint
router.post("/refresh", validateRequest(refreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.body

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET!) as any

    // Get user from database
    const user = await db.getUserByWallet(decoded.walletAddress)
    if (!user) {
      return res.status(401).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      })
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" },
    )

    res.json({
      success: true,
      accessToken: newAccessToken,
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: "Invalid refresh token",
        code: "INVALID_REFRESH_TOKEN",
      })
    }

    logger.error("Token refresh error:", error)
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    })
  }
})

// Disconnect wallet endpoint
router.post("/disconnect", async (req, res) => {
  try {
    const sessionId = req.headers["x-session-id"] as string

    if (sessionId) {
      // Remove session from database and cache
      await db.deleteSession(sessionId)
      await redis.invalidateUserSession(sessionId)
    }

    res.json({
      success: true,
      message: "Disconnected successfully",
    })
  } catch (error) {
    logger.error("Disconnect error:", error)
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get user profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        code: "NO_TOKEN",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const user = await db.getUserByWallet(decoded.walletAddress)

    if (!user) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        walletAddress: user.wallet_address,
        username: user.username,
        email: user.email,
        preferences: user.preferences,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: "Invalid token",
        code: "INVALID_TOKEN",
      })
    }

    logger.error("Profile fetch error:", error)
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    })
  }
})

// Update user preferences
router.put("/preferences", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({
        error: "No token provided",
        code: "NO_TOKEN",
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    const { preferences } = req.body

    const updatedUser = await db.updateUserPreferences(decoded.walletAddress, preferences)

    if (!updatedUser) {
      return res.status(404).json({
        error: "User not found",
        code: "USER_NOT_FOUND",
      })
    }

    res.json({
      success: true,
      preferences: updatedUser.preferences,
    })
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        error: "Invalid token",
        code: "INVALID_TOKEN",
      })
    }

    logger.error("Preferences update error:", error)
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    })
  }
})

// Generate nonce for wallet connection
router.get("/nonce/:walletAddress", async (req, res) => {
  try {
    const { walletAddress } = req.params

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({
        error: "Invalid wallet address format",
        code: "INVALID_WALLET_ADDRESS",
      })
    }

    const nonce = generateNonce()
    const timestamp = Date.now()
    const message = `Sign this message to connect to PsyFi:\n\nWallet: ${walletAddress}\nNonce: ${nonce}\nTimestamp: ${timestamp}`

    // Cache nonce for 5 minutes
    await redis.set(`nonce:${walletAddress}`, nonce, 300)

    res.json({
      success: true,
      message,
      nonce,
      timestamp,
    })
  } catch (error) {
    logger.error("Nonce generation error:", error)
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    })
  }
})

// Utility functions
function generateSessionId(): string {
  return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

function generateNonce(): string {
  return Math.random().toString(36).substr(2, 15)
}

function extractTimestampFromMessage(message: string): number {
  const timestampMatch = message.match(/Timestamp: (\d+)/)
  return timestampMatch ? Number.parseInt(timestampMatch[1], 10) : 0
}

export default router
