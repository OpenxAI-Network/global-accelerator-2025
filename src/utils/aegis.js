// AEGIS Security Utility for Trade Checking
// This integrates AEGIS threat detection with Vibe Trading AI

export class AegisSecurityManager {
  constructor() {
    this.threatLevels = {
      LOW: 'low',
      MEDIUM: 'medium',
      HIGH: 'high',
      CRITICAL: 'critical'
    };
    
    this.securityChecks = [
      this.checkTransactionPattern,
      this.checkAmountThresholds,
      this.checkTokenSecurity,
      this.checkCrossChainThreats,
      this.checkUserRiskProfile
    ];
  }

  /**
   * Main security check for trades
   * @param {Object} trade - Trade object with token, amount, side, user, etc.
   * @returns {Object} Security assessment result
   */
  async checkTradeSecurity(trade) {
    try {
      console.log('🔒 AEGIS: Checking trade security...', trade);
      
      const securityResult = {
        block: false,
        threatLevel: this.threatLevels.LOW,
        warnings: [],
        recommendations: [],
        securityScore: 100,
        timestamp: new Date().toISOString()
      };

      // Run all security checks
      for (const check of this.securityChecks) {
        const result = await check(trade);
        if (result.threat) {
          securityResult.warnings.push(result.message);
          securityResult.securityScore -= result.scoreDeduction;
          
          if (result.level === this.threatLevels.CRITICAL) {
            securityResult.block = true;
            securityResult.threatLevel = this.threatLevels.CRITICAL;
          } else if (result.level === this.threatLevels.HIGH && !securityResult.block) {
            securityResult.threatLevel = this.threatLevels.HIGH;
          }
        }
        
        if (result.recommendation) {
          securityResult.recommendations.push(result.recommendation);
        }
      }

      // Determine final action
      if (securityResult.securityScore < 30) {
        securityResult.block = true;
        securityResult.threatLevel = this.threatLevels.CRITICAL;
      } else if (securityResult.securityScore < 60) {
        securityResult.threatLevel = this.threatLevels.HIGH;
      } else if (securityResult.securityScore < 80) {
        securityResult.threatLevel = this.threatLevels.MEDIUM;
      }

      console.log('🔒 AEGIS: Security check completed', securityResult);
      return securityResult;
      
    } catch (error) {
      console.error('🔒 AEGIS: Security check failed', error);
      // Fail safe - block trade if security check fails
      return {
        block: true,
        threatLevel: this.threatLevels.CRITICAL,
        warnings: ['Security system unavailable - trade blocked for safety'],
        recommendations: ['Contact support immediately'],
        securityScore: 0,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Check for suspicious transaction patterns
   */
  async checkTransactionPattern(trade) {
    const result = { threat: false, level: this.threatLevels.LOW, scoreDeduction: 0 };
    
    // Check for rapid successive trades
    if (trade.user && trade.user.recentTrades) {
      const recentTrades = trade.user.recentTrades.filter(t => 
        Date.now() - new Date(t.timestamp) < 5 * 60 * 1000 // Last 5 minutes
      );
      
      if (recentTrades.length > 10) {
        result.threat = true;
        result.level = this.threatLevels.HIGH;
        result.scoreDeduction = 25;
        result.message = 'Suspicious trading pattern detected: too many rapid trades';
        result.recommendation = 'Slow down trading frequency to avoid triggering security measures';
      }
    }

    // Check for unusual trade sizes
    if (trade.amount && trade.amount > 100000) { // $100k+ trades
      result.threat = true;
      result.level = this.threatLevels.MEDIUM;
      result.scoreDeduction = 15;
      result.message = 'Large trade amount detected';
      result.recommendation = 'Consider breaking large trades into smaller amounts';
    }

    return result;
  }

  /**
   * Check amount thresholds and limits
   */
  async checkAmountThresholds(trade) {
    const result = { threat: false, level: this.threatLevels.LOW, scoreDeduction: 0 };
    
    // Check if trade exceeds user's typical limits
    if (trade.user && trade.user.riskProfile) {
      const { maxTradeAmount, dailyLimit, currentDailyVolume } = trade.user.riskProfile;
      
      if (trade.amount > maxTradeAmount) {
        result.threat = true;
        result.level = this.threatLevels.HIGH;
        result.scoreDeduction = 30;
        result.message = `Trade amount exceeds maximum allowed (${maxTradeAmount})`;
        result.recommendation = 'Reduce trade amount to stay within limits';
      }
      
      if (currentDailyVolume + trade.amount > dailyLimit) {
        result.threat = true;
        result.level = this.threatLevels.MEDIUM;
        result.scoreDeduction = 20;
        result.message = 'Trade would exceed daily trading limit';
        result.recommendation = 'Wait until tomorrow or reduce trade amount';
      }
    }

    return result;
  }

  /**
   * Check token security and blacklist status
   */
  async checkTokenSecurity(trade) {
    const result = { threat: false, level: this.threatLevels.LOW, scoreDeduction: 0 };
    
    // Check if token is blacklisted
    const blacklistedTokens = ['SCAM', 'FAKE', 'RUGPULL'];
    if (blacklistedTokens.includes(trade.token)) {
      result.threat = true;
      result.level = this.threatLevels.CRITICAL;
      result.scoreDeduction = 100;
      result.message = 'Token is blacklisted for security reasons';
      result.recommendation = 'Do not trade this token - it has been flagged as unsafe';
    }

    // Check for new/unknown tokens
    if (trade.token && trade.tokenAge && trade.tokenAge < 24 * 60 * 60 * 1000) { // Less than 24 hours
      result.threat = true;
      result.level = this.threatLevels.MEDIUM;
      result.scoreDeduction = 20;
      result.message = 'Token is very new - exercise caution';
      result.recommendation = 'Research the token thoroughly before trading';
    }

    return result;
  }

  /**
   * Check for cross-chain threats
   */
  async checkCrossChainThreats(trade) {
    const result = { threat: false, level: this.threatLevels.LOW, scoreDeduction: 0 };
    
    // Check if user has suspicious cross-chain activity
    if (trade.user && trade.user.crossChainActivity) {
      const suspiciousChains = trade.user.crossChainActivity.filter(chain => 
        chain.suspiciousTransactions > 5
      );
      
      if (suspiciousChains.length > 0) {
        result.threat = true;
        result.level = this.threatLevels.HIGH;
        result.scoreDeduction = 25;
        result.message = 'Suspicious cross-chain activity detected';
        result.recommendation = 'Review your cross-chain transactions for unusual activity';
      }
    }

    return result;
  }

  /**
   * Check user risk profile and history
   */
  async checkUserRiskProfile(trade) {
    const result = { threat: false, level: this.threatLevels.LOW, scoreDeduction: 0 };
    
    if (trade.user && trade.user.riskProfile) {
      const { riskScore, accountAge, verificationLevel } = trade.user.riskProfile;
      
      // High risk users get extra scrutiny
      if (riskScore > 80) {
        result.threat = true;
        result.level = this.threatLevels.MEDIUM;
        result.scoreDeduction = 20;
        result.message = 'High-risk user profile detected';
        result.recommendation = 'Consider completing additional verification steps';
      }
      
      // New accounts get extra scrutiny
      if (accountAge < 7 * 24 * 60 * 60 * 1000) { // Less than 7 days
        result.threat = true;
        result.level = this.threatLevels.MEDIUM;
        result.scoreDeduction = 15;
        result.message = 'New account - additional verification recommended';
        result.recommendation = 'Complete KYC verification to increase trading limits';
      }
      
      // Unverified accounts get extra scrutiny
      if (verificationLevel === 'unverified') {
        result.threat = true;
        result.level = this.threatLevels.MEDIUM;
        result.scoreDeduction = 20;
        result.message = 'Account not fully verified';
        result.recommendation = 'Complete identity verification for enhanced security';
      }
    }

    return result;
  }

  /**
   * Get user security status
   */
  async getUserSecurityStatus(userId) {
    try {
      // This would typically call your AEGIS backend
      // For now, return mock data
      return {
        userId,
        riskScore: Math.floor(Math.random() * 100),
        threatCount: Math.floor(Math.random() * 5),
        lastThreat: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
        securityLevel: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        recommendations: [
          'Enable 2FA for enhanced security',
          'Complete identity verification',
          'Review recent transactions'
        ]
      };
    } catch (error) {
      console.error('Failed to get user security status:', error);
      return null;
    }
  }

  /**
   * Log security event
   */
  async logSecurityEvent(event) {
    try {
      // This would typically send to your AEGIS backend
      console.log('🔒 AEGIS: Security event logged', event);
      
      // For now, just log to console
      const securityLog = {
        ...event,
        timestamp: new Date().toISOString(),
        sessionId: Math.random().toString(36).substring(7)
      };
      
      // In production, this would go to your security monitoring system
      return securityLog;
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
}

// Export singleton instance
export const aegisSecurity = new AegisSecurityManager();

// Export convenience function
export async function checkTradeSecurity(trade) {
  return await aegisSecurity.checkTradeSecurity(trade);
}

// Export user status function
export async function getUserSecurityStatus(userId) {
  return await aegisSecurity.getUserSecurityStatus(userId);
}
