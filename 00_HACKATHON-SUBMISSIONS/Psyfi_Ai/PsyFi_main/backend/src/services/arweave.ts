import Arweave from "arweave"
import type { JWKInterface } from "arweave/node/lib/wallet"
import fs from "fs"
import { logger } from "../utils/logger"

export class ArweaveService {
  private arweave: Arweave
  private wallet: JWKInterface | null = null

  constructor() {
    this.arweave = Arweave.init({
      host: "arweave.net",
      port: 443,
      protocol: "https",
      timeout: 20000,
      logging: false,
    })
  }

  async initialize(): Promise<void> {
    try {
      // Load wallet from file
      const walletPath = process.env.ARWEAVE_WALLET_PATH || "./arweave-wallet.json"

      if (fs.existsSync(walletPath)) {
        const walletData = fs.readFileSync(walletPath, "utf8")
        this.wallet = JSON.parse(walletData)

        // Get wallet address
        const address = await this.arweave.wallets.jwkToAddress(this.wallet)
        logger.info(`Arweave wallet loaded: ${address}`)

        // Check balance
        const balance = await this.arweave.wallets.getBalance(address)
        const ar = this.arweave.ar.winstonToAr(balance)
        logger.info(`Arweave wallet balance: ${ar} AR`)
      } else {
        logger.warn("Arweave wallet not found, generating new wallet...")
        this.wallet = await this.arweave.wallets.generate()

        // Save wallet to file
        fs.writeFileSync(walletPath, JSON.stringify(this.wallet, null, 2))

        const address = await this.arweave.wallets.jwkToAddress(this.wallet)
        logger.info(`New Arweave wallet generated: ${address}`)
        logger.warn("Please fund this wallet with AR tokens to enable data storage")
      }
    } catch (error) {
      logger.error("Arweave initialization failed:", error)
      throw error
    }
  }

  async getWalletAddress(): Promise<string> {
    if (!this.wallet) {
      throw new Error("Arweave wallet not initialized")
    }
    return await this.arweave.wallets.jwkToAddress(this.wallet)
  }

  async getBalance(): Promise<string> {
    const address = await this.getWalletAddress()
    const balance = await this.arweave.wallets.getBalance(address)
    return this.arweave.ar.winstonToAr(balance)
  }

  async storeData(data: any, tags: { name: string; value: string }[] = []): Promise<string> {
    if (!this.wallet) {
      throw new Error("Arweave wallet not initialized")
    }

    try {
      // Convert data to string if it's an object
      const dataString = typeof data === "string" ? data : JSON.stringify(data, null, 2)

      // Create transaction
      const transaction = await this.arweave.createTransaction(
        {
          data: dataString,
        },
        this.wallet,
      )

      // Add tags
      transaction.addTag("Content-Type", "application/json")
      transaction.addTag("App-Name", "PsyFi")
      transaction.addTag("App-Version", "1.0.0")
      transaction.addTag("Timestamp", new Date().toISOString())

      // Add custom tags
      tags.forEach((tag) => {
        transaction.addTag(tag.name, tag.value)
      })

      // Sign transaction
      await this.arweave.transactions.sign(transaction, this.wallet)

      // Submit transaction
      const response = await this.arweave.transactions.post(transaction)

      if (response.status === 200) {
        logger.info(`Data stored on Arweave: ${transaction.id}`)
        return transaction.id
      } else {
        throw new Error(`Failed to store data: ${response.status} ${response.statusText}`)
      }
    } catch (error) {
      logger.error("Arweave storage error:", error)
      throw error
    }
  }

  async getData(transactionId: string): Promise<any> {
    try {
      const response = await this.arweave.transactions.getData(transactionId, {
        decode: true,
        string: true,
      })

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(response as string)
      } catch {
        return response
      }
    } catch (error) {
      logger.error(`Failed to retrieve data from Arweave: ${transactionId}`, error)
      throw error
    }
  }

  async getTransactionStatus(transactionId: string): Promise<any> {
    try {
      const status = await this.arweave.transactions.getStatus(transactionId)
      return status
    } catch (error) {
      logger.error(`Failed to get transaction status: ${transactionId}`, error)
      throw error
    }
  }

  async getTransactionTags(transactionId: string): Promise<any[]> {
    try {
      const transaction = await this.arweave.transactions.get(transactionId)
      return transaction.tags.map((tag) => ({
        name: tag.get("name", { decode: true, string: true }),
        value: tag.get("value", { decode: true, string: true }),
      }))
    } catch (error) {
      logger.error(`Failed to get transaction tags: ${transactionId}`, error)
      throw error
    }
  }

  // Specialized storage methods for PsyFi data types
  async storePrediction(prediction: any): Promise<string> {
    const tags = [
      { name: "Data-Type", value: "AI-Prediction" },
      { name: "Asset", value: prediction.asset },
      { name: "Prediction-Type", value: prediction.prediction_type },
      { name: "Confidence", value: prediction.confidence.toString() },
      { name: "Model-Version", value: prediction.model_version },
    ]

    return await this.storeData(prediction, tags)
  }

  async storeFraudScan(scan: any): Promise<string> {
    const tags = [
      { name: "Data-Type", value: "Fraud-Scan" },
      { name: "Wallet-Address", value: scan.wallet_address },
      { name: "Risk-Level", value: scan.risk_level },
      { name: "Safety-Score", value: scan.safety_score.toString() },
    ]

    return await this.storeData(scan, tags)
  }

  async storeMemory(memory: any): Promise<string> {
    const tags = [
      { name: "Data-Type", value: "AI-Memory" },
      { name: "Memory-Type", value: memory.memory_type },
      { name: "Outcome", value: memory.outcome },
      { name: "Confidence", value: memory.confidence.toString() },
    ]

    return await this.storeData(memory, tags)
  }

  async storeTradingDecision(decision: any): Promise<string> {
    const tags = [
      { name: "Data-Type", value: "Trading-Decision" },
      { name: "Bot-ID", value: decision.bot_id },
      { name: "Asset", value: decision.asset },
      { name: "Trade-Type", value: decision.trade_type },
      { name: "Amount", value: decision.amount.toString() },
    ]

    return await this.storeData(decision, tags)
  }

  // Query methods
  async queryTransactionsByTag(tagName: string, tagValue: string, limit = 10): Promise<any[]> {
    try {
      const query = {
        op: "equals",
        expr1: tagName,
        expr2: tagValue,
      }

      const results = await this.arweave.api.post("graphql", {
        query: `
          query($tags: [TagFilter!], $first: Int) {
            transactions(tags: $tags, first: $first, sort: HEIGHT_DESC) {
              edges {
                node {
                  id
                  owner {
                    address
                  }
                  tags {
                    name
                    value
                  }
                  block {
                    height
                    timestamp
                  }
                }
              }
            }
          }
        `,
        variables: {
          tags: [query],
          first: limit,
        },
      })

      return results.data.data.transactions.edges.map((edge: any) => edge.node)
    } catch (error) {
      logger.error("Failed to query Arweave transactions:", error)
      return []
    }
  }

  async getPredictionHistory(asset?: string, limit = 50): Promise<any[]> {
    const transactions = await this.queryTransactionsByTag("Data-Type", "AI-Prediction", limit)

    if (asset) {
      return transactions.filter((tx) => tx.tags.some((tag: any) => tag.name === "Asset" && tag.value === asset))
    }

    return transactions
  }

  async getFraudScanHistory(walletAddress?: string, limit = 50): Promise<any[]> {
    const transactions = await this.queryTransactionsByTag("Data-Type", "Fraud-Scan", limit)

    if (walletAddress) {
      return transactions.filter((tx) =>
        tx.tags.some((tag: any) => tag.name === "Wallet-Address" && tag.value === walletAddress),
      )
    }

    return transactions
  }

  async getMemoryHistory(limit = 50): Promise<any[]> {
    return await this.queryTransactionsByTag("Data-Type", "AI-Memory", limit)
  }

  // Utility methods
  async estimateStorageCost(data: any): Promise<string> {
    const dataString = typeof data === "string" ? data : JSON.stringify(data)
    const dataSize = Buffer.byteLength(dataString, "utf8")

    // Get current price per byte (this is an approximation)
    const pricePerByte = await this.arweave.transactions.getPrice(dataSize)
    return this.arweave.ar.winstonToAr(pricePerByte)
  }

  async verifyTransaction(transactionId: string): Promise<boolean> {
    try {
      const status = await this.getTransactionStatus(transactionId)
      return status.status === 200 && status.confirmed
    } catch (error) {
      logger.error(`Failed to verify transaction: ${transactionId}`, error)
      return false
    }
  }

  // Batch operations
  async storeBatch(items: { data: any; tags: { name: string; value: string }[] }[]): Promise<string[]> {
    const results: string[] = []

    for (const item of items) {
      try {
        const txId = await this.storeData(item.data, item.tags)
        results.push(txId)
      } catch (error) {
        logger.error("Batch storage error for item:", error)
        results.push("") // Empty string indicates failure
      }
    }

    return results
  }
}
