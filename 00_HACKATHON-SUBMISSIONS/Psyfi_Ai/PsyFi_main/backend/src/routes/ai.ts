import express from "express"
import axios from "axios"
import { DatabaseService } from "../services/database"
import { RedisService } from "../services/redis"
import { ArweaveService } from "../services/arweave"
import { logger } from "../utils/logger"
import { validateRequest } from "../middleware/validation"
import Joi from "joi"

const router = express.Router()
const db = new DatabaseService()
const redis = new RedisService()
const arweave = new ArweaveService()

// Validation schemas
const predictSchema = Joi.object({
  asset: Joi.string().required(),
  timeframe: Joi.string().valid("1h", "4h", "1d", "7d", "30d").required(),
  predictionType: Joi.string().valid("price", "trend", "sentiment").default("price"),
})

const chatSchema = Joi.object({
  message: Joi.string().min(1).max(1000).required(),
  context: Joi.object().optional(),
})

const generateInsightSchema = Joi.object({
  type: Joi.string().valid("market", "portfolio", "risk").required(),
  parameters: Joi.object().optional(),
})

// Generate AI prediction
router.post("/predict", validateRequest(predictSchema), async (req, res) => {
  try {
    const { asset, timeframe, predictionType } = req.body
    const userId = (req as any).user.userId

    // Check cache first
    const cacheKey = `prediction:${asset}:${timeframe}:${predictionType}`
    const cachedPrediction = await redis.getCachedPrediction(cacheKey)

    if (cachedPrediction) {
      return res.json({
        success: true,
        prediction: cachedPrediction,
        cached: true,
      })
    }

    // Call AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000"
    const aiResponse = await axios.post(
      `${aiServiceUrl}/predict`,
      {
        asset,
        timeframe,
        prediction_type: predictionType,
      },
      {
        timeout: 30000,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    const prediction = aiResponse.data

    // Generate unique prediction ID
    const predictionId = `pred_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`

    // Store on Arweave
    const arweaveData = {
      ...prediction,
      prediction_id: predictionId,
      user_id: userId,
      created_at: new Date().toISOString(),
    }

    const arweaveHash = await arweave.storePrediction(arweaveData)

    // Prepare database entry
    const dbPrediction = {
      prediction_id: predictionId,
      asset,
      prediction_type: predictionType,
      current_price: prediction.current_price,
      predicted_price: prediction.predicted_price,
      predicted_change: prediction.predicted_change,
      confidence: prediction.confidence,
      timeframe,
      reasoning: prediction.reasoning,
      model_version: prediction.model_version,
      arweave_hash: arweaveHash,
      expires_at: calculateExpirationDate(timeframe),
    }

    // Save to database
    const savedPrediction = await db.savePrediction(dbPrediction)

    // Cache for 1 hour
    await redis.cachePrediction(cacheKey, savedPrediction, 3600)

    logger.info(`AI prediction generated: ${predictionId} for ${asset}`)

    res.json({
      success: true,
      prediction: {
        ...savedPrediction,
        arweave_hash: arweaveHash,
      },
    })
  } catch (error) {
    logger.error("AI prediction error:", error)

    if (axios.isAxiosError(error)) {
      return res.status(503).json({
        error: "AI service unavailable",
        code: "AI_SERVICE_ERROR",
        details: error.message,
      })
    }

    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get prediction history
router.get("/predictions", async (req, res) => {
  try {
    const { asset, limit = 50 } = req.query

    const predictions = await db.getPredictions(asset as string, Number.parseInt(limit as string, 10))

    res.json({
      success: true,
      predictions,
      count: predictions.length,
    })
  } catch (error) {
    logger.error("Get predictions error:", error)
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    })
  }
})

// AI Chat interface
router.post("/chat", validateRequest(chatSchema), async (req, res) => {
  try {
    const { message, context } = req.body
    const userId = (req as any).user.userId
    const walletAddress = (req as any).user.walletAddress

    // Get user's portfolio context
    const userPositions = await db.getUserPositions(userId)
    const recentPredictions = await db.getPredictions(undefined, 10)

    // Prepare context for AI
    const aiContext = {
      user: {
        wallet_address: walletAddress,
        positions: userPositions,
      },
      recent_predictions: recentPredictions,
      market_context: context || {},
    }

    // Call AI service
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000"
    const aiResponse = await axios.post(
      `${aiServiceUrl}/chat`,
      {
        message,
        context: aiContext,
      },
      {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    const response = aiResponse.data

    // Store chat interaction on Arweave
    const chatData = {
      user_message: message,
      ai_response: response.response,
      confidence: response.confidence,
      context: aiContext,
      timestamp: new Date().toISOString(),
      user_id: userId,
    }

    const arweaveHash = await arweave.storeData(chatData, [
      { name: "Data-Type", value: "AI-Chat" },
      { name: "User-ID", value: userId.toString() },
      { name: "Confidence", value: response.confidence.toString() },
    ])

    logger.info(`AI chat interaction stored: ${arweaveHash}`)

    res.json({
      success: true,
      response: response.response,
      confidence: response.confidence,
      arweave_hash: arweaveHash,
    })
  } catch (error) {
    logger.error("AI chat error:", error)

    if (axios.isAxiosError(error)) {
      return res.status(503).json({
        error: "AI service unavailable",
        code: "AI_SERVICE_ERROR",
        details: error.message,
      })
    }

    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    })
  }
})

// Generate comprehensive AI insight
router.post("/generate-insight", validateRequest(generateInsightSchema), async (req, res) => {
  try {
    const { type, parameters } = req.body
    const userId = (req as any).user.userId

    // Call AI service for insight generation
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000"
    const aiResponse = await axios.post(
      `${aiServiceUrl}/generate-insight`,
      {
        type,
        parameters,
        user_id: userId,
      },
      {
        timeout: 45000, // Longer timeout for complex insights
        headers: {
          "Content-Type": "application/json",
        },
      },
    )

    const insight = aiResponse.data

    // Generate unique insight ID
    const insightId = `insight_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`

    // Store on Arweave
    const arweaveData = {
      ...insight,
      insight_id: insightId,
      user_id: userId,
      generated_at: new Date().toISOString(),
    }

    const arweaveHash = await arweave.storeData(arweaveData, [
      { name: "Data-Type", value: "AI-Insight" },
      { name: "Insight-Type", value: type },
      { name: "User-ID", value: userId.toString() },
      { name: "Confidence", value: insight.confidence.toString() },
    ])

    logger.info(`AI insight generated: ${insightId} for user ${userId}`)

    res.json({
      success: true,
      insight: {
        ...insight,
        insight_id: insightId,
        arweave_hash: arweaveHash,
      },
    })
  } catch (error) {
    logger.error("AI insight generation error:", error)

    if (axios.isAxiosError(error)) {
      return res.status(503).json({
        error: "AI service unavailable",
        code: "AI_SERVICE_ERROR",
        details: error.message,
      })
    }

    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    })
  }
})

// Get AI model statistics
router.get("/stats", async (req, res) => {
  try {
    // Call AI service for model stats
    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000"
    const aiResponse = await axios.get(`${aiServiceUrl}/stats`, {
      timeout: 10000,
    })

    const stats = aiResponse.data

    // Get additional stats from database
    const totalPredictions = await db.query("SELECT COUNT(*) as count FROM ai_predictions")

    const accuracyStats = await db.query(`
      SELECT 
        AVG(accuracy_score) as avg_accuracy,
        COUNT(*) as total_evaluated
      FROM ai_predictions 
      WHERE accuracy_score IS NOT NULL
    `)

    const combinedStats = {
      ...stats,
      database_stats: {
        total_predictions: Number.parseInt(totalPredictions.rows[0].count, 10),
        average_accuracy: Number.parseFloat(accuracyStats.rows[0].avg_accuracy || "0"),
        total_evaluated: Number.parseInt(accuracyStats.rows[0].total_evaluated, 10),
      },
    }

    res.json({
      success: true,
      stats: combinedStats,
    })
  } catch (error) {
    logger.error("AI stats error:", error)

    if (axios.isAxiosError(error)) {
      return res.status(503).json({
        error: "AI service unavailable",
        code: "AI_SERVICE_ERROR",
      })
    }

    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    })
  }
})

// Validate prediction outcome (for accuracy tracking)
router.post("/validate-prediction/:predictionId", async (req, res) => {
  try {
    const { predictionId } = req.params
    const { actualOutcome } = req.body

    // Get prediction from database
    const prediction = await db.query("SELECT * FROM ai_predictions WHERE prediction_id = $1", [predictionId])

    if (prediction.rows.length === 0) {
      return res.status(404).json({
        error: "Prediction not found",
        code: "PREDICTION_NOT_FOUND",
      })
    }

    const pred = prediction.rows[0]

    // Calculate accuracy score
    const accuracyScore = calculateAccuracyScore(pred.predicted_change, actualOutcome)

    // Update prediction with actual outcome
    await db.query(
      `
      UPDATE ai_predictions 
      SET actual_outcome = $1, accuracy_score = $2
      WHERE prediction_id = $3
    `,
      [actualOutcome, accuracyScore, predictionId],
    )

    // Store validation on Arweave
    const validationData = {
      prediction_id: predictionId,
      predicted_change: pred.predicted_change,
      actual_outcome: actualOutcome,
      accuracy_score: accuracyScore,
      validated_at: new Date().toISOString(),
    }

    const arweaveHash = await arweave.storeData(validationData, [
      { name: "Data-Type", value: "Prediction-Validation" },
      { name: "Prediction-ID", value: predictionId },
      { name: "Accuracy-Score", value: accuracyScore.toString() },
    ])

    logger.info(`Prediction validated: ${predictionId} with accuracy ${accuracyScore}%`)

    res.json({
      success: true,
      validation: {
        prediction_id: predictionId,
        accuracy_score: accuracyScore,
        arweave_hash: arweaveHash,
      },
    })
  } catch (error) {
    logger.error("Prediction validation error:", error)
    res.status(500).json({
      error: "Internal server error",
      code: "INTERNAL_ERROR",
    })
  }
})

// Utility functions
function calculateExpirationDate(timeframe: string): Date {
  const now = new Date()
  const timeframes: { [key: string]: number } = {
    "1h": 1 * 60 * 60 * 1000,
    "4h": 4 * 60 * 60 * 1000,
    "1d": 24 * 60 * 60 * 1000,
    "7d": 7 * 24 * 60 * 60 * 1000,
    "30d": 30 * 24 * 60 * 60 * 1000,
  }

  return new Date(now.getTime() + (timeframes[timeframe] || timeframes["1d"]))
}

function calculateAccuracyScore(predicted: number, actual: number): number {
  const error = Math.abs(predicted - actual)
  const maxError = Math.max(Math.abs(predicted), Math.abs(actual), 1)
  const accuracy = Math.max(0, 100 - (error / maxError) * 100)
  return Math.round(accuracy * 100) / 100
}

export default router
