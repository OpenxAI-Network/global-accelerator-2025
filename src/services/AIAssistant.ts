import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AICommand {
  text: string;
  timestamp: string;
  context?: string;
}

export interface AIResponse {
  response: string;
  confidence: number;
  taskType: string;
  suggestions: string[];
  data?: any;
  timestamp: string;
}

export interface AIContext {
  userProfile?: {
    experience: 'beginner' | 'intermediate' | 'expert';
    focus: 'defi' | 'security' | 'development' | 'trading';
    chains: string[];
  };
  currentPortfolio?: {
    assets: Array<{ symbol: string; amount: number; chain: string }>;
    totalValue: number;
    riskLevel: 'low' | 'medium' | 'high';
  };
  projectContext?: {
    type: 'defi' | 'nft' | 'dao' | 'cross-chain';
    stage: 'planning' | 'development' | 'testing' | 'deployed';
    technologies: string[];
  };
}

export class AIAssistant {
  private gemini: GoogleGenerativeAI;
  private model: any;
  private isAvailable: boolean = false;
  private context: AIContext = {};

  constructor(apiKey?: string) {
    if (apiKey) {
      try {
        this.gemini = new GoogleGenerativeAI(apiKey);
        this.model = this.gemini.getGenerativeModel({ 
          model: 'gemini-2.0-flash',
          generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.3,
            topP: 0.8,
            topK: 40
          }
        });
        this.isAvailable = true;
        console.log('🚀 AI Assistant initialized with Gemini AI');
      } catch (error) {
        console.error('❌ Failed to initialize Gemini AI:', error);
        this.isAvailable = false;
      }
    } else {
      console.log('⚠️ AI Assistant running in demo mode (no API key)');
      this.isAvailable = false;
    }
  }

  /**
   * Set user context for better AI responses
   */
  setContext(context: Partial<AIContext>) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Process natural language command and generate AI response
   */
  async processCommand(command: AICommand): Promise<AIResponse> {
    if (this.isAvailable) {
      return await this.processWithGemini(command);
    } else {
      return await this.processWithDemoAI(command);
    }
  }

  /**
   * Process command using Gemini AI
   */
  private async processWithGemini(command: AICommand): Promise<AIResponse> {
    try {
      const prompt = this.buildPrompt(command);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text, command);
    } catch (error) {
      console.error('Gemini AI processing failed:', error);
      return await this.processWithDemoAI(command);
    }
  }

  /**
   * Process command using demo AI (fallback)
   */
  private async processWithDemoAI(command: AICommand): Promise<AIResponse> {
    const lowerCommand = command.text.toLowerCase();
    
    // Analyze command intent
    const intent = this.analyzeIntent(lowerCommand);
    
    // Generate contextual response
    const response = this.generateContextualResponse(intent, command);
    
    return {
      response: response.text,
      confidence: response.confidence,
      taskType: intent.type,
      suggestions: response.suggestions,
      data: response.data,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Build comprehensive prompt for Gemini AI
   */
  private buildPrompt(command: AICommand): string {
    const context = this.formatContext();
    
    return `You are an expert AI assistant for the AEGIS DeFi project. Analyze this user command and provide a helpful, accurate response.

USER COMMAND: "${command.text}"

USER CONTEXT: ${context}

PROJECT CONTEXT: AEGIS is a cross-chain DeFi protocol with AI-powered security, lending, and portfolio management features.

RESPONSE REQUIREMENTS:
1. Provide a clear, actionable response
2. Include specific DeFi insights and recommendations
3. Consider the user's experience level and focus area
4. Suggest next steps or follow-up actions
5. Be concise but comprehensive

RESPONSE FORMAT (JSON):
{
  "response": "Your main response text",
  "confidence": 0.95,
  "taskType": "lending|security|development|portfolio|general",
  "suggestions": ["suggestion1", "suggestion2"],
  "data": {
    "relevantInfo": "Additional structured data"
  }
}`;
  }

  /**
   * Parse Gemini AI response
   */
  private parseGeminiResponse(text: string, command: AICommand): AIResponse {
    try {
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          response: parsed.response || text,
          confidence: parsed.confidence || 0.9,
          taskType: parsed.taskType || 'general',
          suggestions: parsed.suggestions || [],
          data: parsed.data || {},
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.warn('Failed to parse Gemini response as JSON:', error);
    }

    // Fallback: analyze the text response
    const intent = this.analyzeIntent(command.text.toLowerCase());
    return {
      response: text,
      confidence: 0.8,
      taskType: intent.type,
      suggestions: this.generateSuggestions(intent.type),
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Analyze command intent using NLP techniques
   */
  private analyzeIntent(command: string): {
    type: string;
    entities: string[];
    confidence: number;
    action: string;
  } {
    const entities: string[] = [];
    let type = 'general';
    let action = 'query';
    let confidence = 0.7;

    // Extract entities (tokens, amounts, chains, etc.)
    const tokenPattern = /\b(BTC|ETH|USDC|USDT|DAI|SOL|MATIC|AVAX|ARB|OP)\b/gi;
    const amountPattern = /\b(\d+(?:\.\d+)?)\s*(?:BTC|ETH|USDC|USDT|DAI|SOL|MATIC|AVAX|ARB|OP)?\b/gi;
    const chainPattern = /\b(Ethereum|Polygon|Arbitrum|Optimism|Avalanche|Solana|ZetaChain|Base)\b/gi;
    const percentagePattern = /\b(\d+(?:\.\d+)?)%\b/g;
    const ltvPattern = /\bLTV\b/gi;

    // Extract entities
    const tokens = command.match(tokenPattern) || [];
    const amounts = command.match(amountPattern) || [];
    const chains = command.match(chainPattern) || [];
    const percentages = command.match(percentagePattern) || [];
    const hasLTV = ltvPattern.test(command);

    entities.push(...tokens, ...amounts, ...chains, ...percentages);

    // Intent classification
    if (command.includes('loan') || command.includes('borrow') || command.includes('lend') || hasLTV) {
      type = 'lending';
      action = 'borrow';
      confidence = 0.9;
    } else if (command.includes('security') || command.includes('risk') || command.includes('vulnerability') || command.includes('attack')) {
      type = 'security';
      action = 'analyze';
      confidence = 0.9;
    } else if (command.includes('code') || command.includes('contract') || command.includes('generate') || command.includes('create')) {
      type = 'development';
      action = 'generate';
      confidence = 0.9;
    } else if (command.includes('portfolio') || command.includes('strategy') || command.includes('optimize') || command.includes('yield')) {
      type = 'portfolio';
      action = 'optimize';
      confidence = 0.9;
    } else if (command.includes('price') || command.includes('market') || command.includes('chart') || command.includes('trend')) {
      type = 'market';
      action = 'analyze';
      confidence = 0.8;
    } else if (command.includes('cross-chain') || command.includes('bridge') || command.includes('transfer')) {
      type = 'cross-chain';
      action = 'execute';
      confidence = 0.8;
    }

    return { type, entities, confidence, action };
  }

  /**
   * Generate contextual response based on intent
   */
  private generateContextualResponse(intent: any, command: AICommand): {
    text: string;
    confidence: number;
    suggestions: string[];
    data: any;
  } {
    const { type, entities, action } = intent;
    const userExp = this.context.userProfile?.experience || 'intermediate';
    const userFocus = this.context.userProfile?.focus || 'defi';

    let response = '';
    let suggestions: string[] = [];
    let data: any = {};

    switch (type) {
      case 'lending':
        response = this.generateLendingResponse(command.text, entities, userExp);
        suggestions = [
          'Check current LTV ratios for your assets',
          'Calculate optimal borrowing amounts',
          'Review lending pool APYs',
          'Set up automated repayments'
        ];
        data = {
          taskType: 'lending',
          entities: entities,
          recommendedActions: ['borrow', 'repay', 'manage']
        };
        break;

      case 'security':
        response = this.generateSecurityResponse(command.text, entities, userExp);
        suggestions = [
          'Run security audit on smart contracts',
          'Check for known vulnerabilities',
          'Review access controls',
          'Monitor for suspicious activity'
        ];
        data = {
          taskType: 'security',
          entities: entities,
          riskLevel: 'medium',
          recommendedActions: ['audit', 'monitor', 'protect']
        };
        break;

      case 'development':
        response = this.generateDevelopmentResponse(command.text, entities, userExp);
        suggestions = [
          'Review code for best practices',
          'Add comprehensive testing',
          'Implement security measures',
          'Optimize gas usage'
        ];
        data = {
          taskType: 'development',
          entities: entities,
          recommendedActions: ['code', 'test', 'deploy']
        };
        break;

      case 'portfolio':
        response = this.generatePortfolioResponse(command.text, entities, userExp);
        suggestions = [
          'Diversify across multiple chains',
          'Rebalance based on market conditions',
          'Set stop-loss orders',
          'Track performance metrics'
        ];
        data = {
          taskType: 'portfolio',
          entities: entities,
          recommendedActions: ['analyze', 'optimize', 'rebalance']
        };
        break;

      case 'market':
        response = this.generateMarketResponse(command.text, entities, userExp);
        suggestions = [
          'Check market sentiment indicators',
          'Review historical price data',
          'Monitor trading volume',
          'Set price alerts'
        ];
        data = {
          taskType: 'market',
          entities: entities,
          recommendedActions: ['analyze', 'monitor', 'trade']
        };
        break;

      case 'cross-chain':
        response = this.generateCrossChainResponse(command.text, entities, userExp);
        suggestions = [
          'Compare bridge fees across chains',
          'Check transaction status',
          'Monitor gas prices',
          'Set up cross-chain notifications'
        ];
        data = {
          taskType: 'cross-chain',
          entities: entities,
          recommendedActions: ['bridge', 'monitor', 'optimize']
        };
        break;

      default:
        response = this.generateGeneralResponse(command.text, entities, userExp);
        suggestions = [
          'Explore DeFi lending opportunities',
          'Check portfolio security status',
          'Review development best practices',
          'Optimize cross-chain strategies'
        ];
        data = {
          taskType: 'general',
          entities: entities,
          recommendedActions: ['explore', 'learn', 'optimize']
        };
    }

    return {
      text: response,
      confidence: intent.confidence,
      suggestions,
      data
    };
  }

  /**
   * Generate lending-specific responses
   */
  private generateLendingResponse(command: string, entities: string[], userExp: string): string {
    const hasBTC = entities.some(e => e.toUpperCase() === 'BTC');
    const hasETH = entities.some(e => e.toUpperCase() === 'ETH');
    const hasUSDC = entities.some(e => e.toUpperCase() === 'USDC');
    
    if (hasBTC || hasETH) {
      const asset = hasBTC ? 'BTC' : 'ETH';
      const ltv = hasBTC ? '65%' : '70%';
      return `Based on your ${asset} collateral, I recommend borrowing USDC at ${ltv} LTV for optimal risk management. Current lending pools offer competitive rates: Avalanche at 4.2% APY, Polygon at 3.8% APY. Consider diversifying across multiple chains for better yields.`;
    } else if (hasUSDC) {
      return `For USDC borrowing, current best rates are on Arbitrum (3.2% APY) and Optimism (3.5% APY). LTV ratios range from 75-85% depending on collateral quality. I recommend starting with smaller amounts to test the protocol.`;
    }
    
    return `I can help you with lending strategies! Based on current market conditions, ETH offers the best LTV ratios (up to 70%), while BTC provides stability at 65% LTV. Would you like me to calculate specific borrowing amounts or show you the best lending pools?`;
  }

  /**
   * Generate security-specific responses
   */
  private generateSecurityResponse(command: string, entities: string[], userExp: string): string {
    if (command.includes('portfolio') || command.includes('risk')) {
      return `Your portfolio security analysis shows moderate risk (6/10). Key concerns: 40% exposure to single chain, limited diversification. Recommendations: Implement multi-sig wallets, add cross-chain security protocols, and set up automated monitoring for suspicious transactions.`;
    } else if (command.includes('contract') || command.includes('vulnerability')) {
      return `Smart contract security is critical for DeFi protocols. I recommend implementing: reentrancy guards, access control modifiers, proper error handling, and comprehensive testing. Consider using established libraries like OpenZeppelin for proven security patterns.`;
    }
    
    return `Security is paramount in DeFi. Your current setup shows good practices with multi-factor authentication and regular audits. Consider adding: real-time threat monitoring, automated security alerts, and cross-chain security protocols for enhanced protection.`;
  }

  /**
   * Generate development-specific responses
   */
  private generateDevelopmentResponse(command: string, entities: string[], userExp: string): string {
    if (command.includes('contract') || command.includes('generate')) {
      return `I'll help you create a secure smart contract! Based on your requirements, I recommend using Solidity 0.8.19+ with OpenZeppelin contracts. Key features to include: access controls, reentrancy protection, proper validation, and comprehensive testing. Would you like me to generate the contract code?`;
    } else if (command.includes('code') || command.includes('review')) {
      return `Code review is essential for security. I'll analyze your smart contracts for: common vulnerabilities, gas optimization opportunities, best practices compliance, and testing coverage. This helps catch issues before deployment and saves costs in the long run.`;
    }
    
    return `Development best practices for DeFi protocols include: modular architecture, comprehensive testing, security-first design, and gas optimization. I can help you with code generation, review, testing strategies, and deployment best practices. What specific development task do you need help with?`;
  }

  /**
   * Generate portfolio-specific responses
   */
  private generatePortfolioResponse(command: string, entities: string[], userExp: string): string {
    if (command.includes('optimize') || command.includes('yield')) {
      return `Portfolio optimization for maximum yield: Current allocation shows 60% ETH, 25% BTC, 15% altcoins. I recommend: rebalancing to 50% ETH, 30% BTC, 20% altcoins for better risk-adjusted returns. Consider adding yield farming on Polygon and cross-chain arbitrage opportunities.`;
    } else if (command.includes('strategy')) {
      return `Your cross-chain strategy should focus on: Ethereum for core holdings, Polygon for DeFi activities, Arbitrum for trading, and ZetaChain for cross-chain operations. This provides optimal yield opportunities while maintaining security and liquidity across multiple ecosystems.`;
    }
    
    return `Portfolio management is key to DeFi success. Your current setup shows good diversification across chains. I recommend: regular rebalancing (monthly), yield optimization strategies, risk management protocols, and automated monitoring. Would you like me to analyze your current allocation and suggest improvements?`;
  }

  /**
   * Generate market-specific responses
   */
  private generateMarketResponse(command: string, entities: string[], userExp: string): string {
    if (command.includes('price') || command.includes('market')) {
      return `Current market analysis shows: ETH consolidating at $3,200 support, BTC testing $65,000 resistance, DeFi tokens showing mixed signals. Market sentiment is cautiously optimistic with increasing institutional adoption. Consider dollar-cost averaging during dips.`;
    } else if (command.includes('trend') || command.includes('chart')) {
      return `Market trends indicate: DeFi TVL growing steadily, cross-chain activity increasing, Layer 2 adoption accelerating. Key opportunities: cross-chain arbitrage, yield farming on emerging chains, and early adoption of new DeFi protocols.`;
    }
    
    return `Market analysis is crucial for informed DeFi decisions. Current conditions show: moderate volatility, increasing institutional interest, and growing cross-chain adoption. I recommend: staying diversified, monitoring key support/resistance levels, and being prepared for both bullish and bearish scenarios.`;
  }

  /**
   * Generate cross-chain-specific responses
   */
  private generateCrossChainResponse(command: string, entities: string[], userExp: string): string {
    if (command.includes('bridge') || command.includes('transfer')) {
      return `Cross-chain transfers: Current best options are ZetaChain (lowest fees), LayerZero (fastest), and Stargate (most liquid). Gas optimization: batch transfers, use off-peak hours, and consider Layer 2 solutions for cost savings.`;
    } else if (command.includes('cross-chain')) {
      return `Cross-chain DeFi strategy: Leverage opportunities across Ethereum (security), Polygon (yields), Arbitrum (trading), and emerging chains. Use cross-chain messaging protocols for seamless operations and consider automated arbitrage bots for profit optimization.`;
    }
    
    return `Cross-chain functionality is essential for modern DeFi. Your setup shows good multi-chain presence. I recommend: optimizing gas costs across chains, implementing cross-chain monitoring, and exploring emerging cross-chain protocols for new opportunities.`;
  }

  /**
   * Generate general responses
   */
  private generateGeneralResponse(command: string, entities: string[], userExp: string): string {
    return `I understand you're asking about "${command}". As your AI DeFi assistant, I can help with: lending strategies, security analysis, code development, portfolio optimization, market analysis, and cross-chain operations. What specific area would you like to explore? I'm here to provide expert guidance for your AEGIS project.`;
  }

  /**
   * Generate relevant suggestions
   */
  private generateSuggestions(taskType: string): string[] {
    const suggestions: { [key: string]: string[] } = {
      lending: [
        'Check current LTV ratios',
        'Compare lending pool APYs',
        'Calculate optimal borrowing amounts',
        'Set up automated repayments'
      ],
      security: [
        'Run security audit',
        'Check for vulnerabilities',
        'Review access controls',
        'Monitor for threats'
      ],
      development: [
        'Generate smart contract code',
        'Review existing code',
        'Add comprehensive testing',
        'Optimize gas usage'
      ],
      portfolio: [
        'Analyze current allocation',
        'Optimize for maximum yield',
        'Rebalance portfolio',
        'Set risk management rules'
      ],
      market: [
        'Check market sentiment',
        'Review price trends',
        'Monitor trading volume',
        'Set price alerts'
      ],
      'cross-chain': [
        'Compare bridge fees',
        'Optimize gas costs',
        'Monitor transactions',
        'Set up notifications'
      ]
    };

    return suggestions[taskType] || [
      'Explore DeFi opportunities',
      'Check portfolio status',
      'Review security measures',
      'Optimize strategies'
    ];
  }

  /**
   * Format user context for AI prompts
   */
  private formatContext(): string {
    const parts = [];
    
    if (this.context.userProfile) {
      parts.push(`Experience: ${this.context.userProfile.experience}`);
      parts.push(`Focus: ${this.context.userProfile.focus}`);
      parts.push(`Chains: ${this.context.userProfile.chains.join(', ')}`);
    }
    
    if (this.context.currentPortfolio) {
      parts.push(`Portfolio Value: $${this.context.currentPortfolio.totalValue.toLocaleString()}`);
      parts.push(`Risk Level: ${this.context.currentPortfolio.riskLevel}`);
      parts.push(`Assets: ${this.context.currentPortfolio.assets.map(a => `${a.amount} ${a.symbol} on ${a.chain}`).join(', ')}`);
    }
    
    if (this.context.projectContext) {
      parts.push(`Project Type: ${this.context.projectContext.type}`);
      parts.push(`Stage: ${this.context.projectContext.stage}`);
      parts.push(`Technologies: ${this.context.projectContext.technologies.join(', ')}`);
    }
    
    return parts.length > 0 ? parts.join(' | ') : 'No specific context provided';
  }

  /**
   * Get AI Assistant status
   */
  getStatus(): { available: boolean; mode: string; capabilities: string[] } {
    return {
      available: this.isAvailable,
      mode: this.isAvailable ? 'Gemini AI' : 'Demo AI',
      capabilities: [
        'Natural Language Processing',
        'Intent Recognition',
        'Context Awareness',
        'DeFi Expertise',
        'Security Analysis',
        'Development Guidance',
        'Portfolio Optimization',
        'Market Analysis'
      ]
    };
  }
}
