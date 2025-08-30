// Aegis AI Agent - Interactive UI Script
class AegisAIInterface {
    constructor() {
        this.chatHistory = [];
        this.currentUser = 'User';
        this.isConnected = false;
        this.agentStatus = {
            perception: { status: 'active', metrics: {} },
            cognitive: { status: 'active', metrics: {} },
            action: { status: 'active', metrics: {} },
            learning: { status: 'active', metrics: {} }
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadInitialData();
        this.startRealTimeUpdates();
        this.addWelcomeMessage();
    }

    bindEvents() {
        // Settings modal
        document.getElementById('settingsBtn').addEventListener('click', () => this.showSettings());
        document.getElementById('closeSettingsBtn').addEventListener('click', () => this.hideSettings());
        document.getElementById('cancelSettingsBtn').addEventListener('click', () => this.hideSettings());
        document.getElementById('saveSettingsBtn').addEventListener('click', () => this.saveSettings());

        // Chat functionality
        document.getElementById('sendBtn').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Chat controls
        document.getElementById('clearChatBtn').addEventListener('click', () => this.clearChat());
        document.getElementById('exportChatBtn').addEventListener('click', () => this.exportChat());

        // Quick actions
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleQuickAction(e.target.dataset.action));
        });

        // Wallet connection
        document.getElementById('connectBtn').addEventListener('click', () => this.connectWallet());

        // Navigation
        document.querySelectorAll('.nav-item a').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Auto-resize textarea
        this.setupTextareaAutoResize();
    }

    setupTextareaAutoResize() {
        const textarea = document.getElementById('chatInput');
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        });
    }

    loadInitialData() {
        // Simulate loading initial data
        this.updateAgentMetrics();
        this.updateStats();
    }

    startRealTimeUpdates() {
        // Simulate real-time updates every 5 seconds
        setInterval(() => {
            this.updateAgentMetrics();
            this.updateStats();
        }, 5000);

        // Simulate agent status changes
        setInterval(() => {
            this.simulateAgentActivity();
        }, 8000);
    }

    addWelcomeMessage() {
        const welcomeMessage = {
            type: 'assistant',
            content: `Welcome to Aegis AI! I'm your intelligent security and cross-chain management assistant. I can help you with:

🔒 Security monitoring and threat detection
📊 Portfolio analysis and risk assessment  
🔗 Cross-chain operations and asset management
🤖 AI-powered decision making and automation

How can I assist you today?`,
            timestamp: new Date(),
            avatar: 'AI'
        };

        this.addMessageToChat(welcomeMessage);
    }

    sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        const userMessage = {
            type: 'user',
            content: message,
            timestamp: new Date(),
            avatar: this.currentUser.charAt(0).toUpperCase()
        };

        this.addMessageToChat(userMessage);
        input.value = '';
        input.style.height = 'auto';

        // Simulate AI response
        this.simulateAIResponse(message);
    }

    simulateAIResponse(userMessage) {
        // Show typing indicator
        this.showTypingIndicator();

        // Simulate processing time
        setTimeout(() => {
            this.hideTypingIndicator();
            const response = this.generateAIResponse(userMessage);
            this.addMessageToChat(response);
        }, 1000 + Math.random() * 2000);
    }

    generateAIResponse(userMessage) {
        const responses = {
            'security': {
                content: `🔒 **Security Status Update**

Your portfolio security score is currently **94.2/100** (Excellent)

**Recent Activity:**
• 2 potential threats detected and mitigated
• Cross-chain security protocols active
• AI agents monitoring 24/7

**Recommendations:**
• Consider enabling additional 2FA for high-value transactions
• Review recent login attempts (3 new devices detected)
• Portfolio diversification is optimal for current risk level

Would you like me to run a detailed security audit or adjust any security parameters?`,
                type: 'assistant'
            },
            'portfolio': {
                content: `📊 **Portfolio Analysis**

**Current Value:** $127,432.18 (+5.3% this week)

**Asset Distribution:**
• DeFi Protocols: 45% ($57,344)
• Cross-Chain Assets: 30% ($38,230)
• Stablecoins: 15% ($19,115)
• NFTs: 10% ($12,743)

**Performance Highlights:**
• Top Performer: Cross-chain yield farming (+12.4%)
• Risk Level: Moderate (LTV: 65%)
• Liquidation Buffer: $18,500

**AI Recommendations:**
• Consider rebalancing to increase stablecoin allocation
• Cross-chain opportunities detected on Polygon
• Risk-adjusted returns are above market average

Need help with rebalancing or exploring new opportunities?`,
                type: 'assistant'
            },
            'risk': {
                content: `⚠️ **Risk Assessment Report**

**Overall Risk Score:** 7.2/10 (Moderate-High)

**Current Risk Factors:**
• High LTV ratio (65%) - approaching recommended limit
• Market volatility increased by 23% this week
• 2 active positions near liquidation threshold

**Immediate Actions Required:**
• Reduce LTV to below 60% within 24 hours
• Consider adding collateral to high-risk positions
• Monitor market conditions for potential flash crashes

**AI Agent Status:**
• Perception Agent: Monitoring market conditions
• Cognitive Agent: Analyzing risk patterns
• Action Agent: Ready to execute protective measures

**Automated Protection:**
• Stop-loss orders active for high-risk positions
• Cross-chain asset rebalancing enabled
• Emergency liquidation protocols ready

Would you like me to execute any protective measures or adjust risk parameters?`,
                type: 'assistant'
            },
            'cross-chain': {
                content: `🔗 **Cross-Chain Status Report**

**Active Connections:** 5 chains
• Ethereum Mainnet: Connected ✅
• Polygon: Connected ✅  
• Arbitrum: Connected ✅
• Optimism: Connected ✅
• Base: Connected ✅

**Current Operations:**
• Asset bridging: 3 transactions pending
• Yield farming: Active on 4 chains
• Liquidity provision: 2 pools active

**Performance Metrics:**
• Cross-chain transaction success rate: 99.4%
• Average bridge time: 2.3 minutes
• Gas optimization: 23% savings achieved

**Recent Activity:**
• 15 minutes ago: USDC bridged to Polygon
• 2 hours ago: ETH bridged to Arbitrum
• 6 hours ago: Yield farming rewards claimed

**AI Monitoring:**
• All bridges operating normally
• No congestion detected
• Gas prices within optimal range

Need help with a specific cross-chain operation?`,
                type: 'assistant'
            }
        };

        // Check for keywords in user message
        const lowerMessage = userMessage.toLowerCase();
        if (lowerMessage.includes('security') || lowerMessage.includes('protect') || lowerMessage.includes('safe')) {
            return { ...responses.security, timestamp: new Date(), avatar: 'AI' };
        } else if (lowerMessage.includes('portfolio') || lowerMessage.includes('balance') || lowerMessage.includes('value')) {
            return { ...responses.portfolio, timestamp: new Date(), avatar: 'AI' };
        } else if (lowerMessage.includes('risk') || lowerMessage.includes('danger') || lowerMessage.includes('threat')) {
            return { ...responses.risk, timestamp: new Date(), avatar: 'AI' };
        } else if (lowerMessage.includes('cross') || lowerMessage.includes('chain') || lowerMessage.includes('bridge')) {
            return { ...responses.cross-chain, timestamp: new Date(), avatar: 'AI' };
        } else {
            // Generic response
            return {
                type: 'assistant',
                content: `I understand you're asking about "${userMessage}". Let me analyze this and provide you with the most relevant information.

**AI Analysis in Progress...**
• Processing your request through Perception Agent
• Gathering relevant data from multiple sources
• Analyzing patterns and trends
• Preparing actionable insights

This should take just a moment. In the meantime, you can use the quick action buttons below for common queries, or ask me something more specific about security, portfolio management, or cross-chain operations.`,
                timestamp: new Date(),
                avatar: 'AI'
            };
        }
    }

    addMessageToChat(message) {
        this.chatHistory.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    }

    renderMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}`;

        const timeString = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        messageElement.innerHTML = `
            <div class="message-avatar">${message.avatar}</div>
            <div class="message-content">
                ${message.content}
                <div class="message-time">${timeString}</div>
            </div>
        `;

        chatMessages.appendChild(messageElement);
    }

    showTypingIndicator() {
        const chatMessages = document.getElementById('chatMessages');
        const typingElement = document.createElement('div');
        typingElement.className = 'message assistant typing';
        typingElement.id = 'typingIndicator';
        typingElement.innerHTML = `
            <div class="message-avatar">AI</div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        chatMessages.appendChild(typingElement);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    clearChat() {
        if (confirm('Are you sure you want to clear the chat history?')) {
            this.chatHistory = [];
            document.getElementById('chatMessages').innerHTML = '';
            this.addWelcomeMessage();
        }
    }

    exportChat() {
        const chatText = this.chatHistory.map(msg => 
            `[${msg.timestamp.toLocaleString()}] ${msg.type.toUpperCase()}: ${msg.content}`
        ).join('\n\n');
        
        const blob = new Blob([chatText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `aegis-chat-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showToast('Chat exported successfully!', 'success');
    }

    handleQuickAction(action) {
        const actions = {
            'security-check': 'Run a comprehensive security check on my portfolio and cross-chain operations.',
            'portfolio-review': 'Analyze my current portfolio performance and provide optimization recommendations.',
            'risk-assessment': 'Assess current risk levels and suggest protective measures.',
            'cross-chain-status': 'Show me the current status of all cross-chain connections and operations.'
        };

        if (actions[action]) {
            document.getElementById('chatInput').value = actions[action];
            this.sendMessage();
        }
    }

    showSettings() {
        document.getElementById('settingsModal').classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    hideSettings() {
        document.getElementById('settingsModal').classList.remove('show');
        document.body.style.overflow = 'auto';
    }

    saveSettings() {
        // Collect settings values
        const settings = {
            aiModel: document.getElementById('aiModel').value,
            responseSpeed: document.getElementById('responseSpeed').value,
            securityAlerts: document.getElementById('securityAlerts').checked,
            portfolioUpdates: document.getElementById('portfolioUpdates').checked,
            aiDecisions: document.getElementById('aiDecisions').checked
        };

        // Save to localStorage (in real app, this would go to backend)
        localStorage.setItem('aegisSettings', JSON.stringify(settings));
        
        this.hideSettings();
        this.showToast('Settings saved successfully!', 'success');
        
        // Apply settings
        this.applySettings(settings);
    }

    applySettings(settings) {
        // Apply AI model setting
        console.log('AI Model changed to:', settings.aiModel);
        
        // Apply notification settings
        if (settings.securityAlerts) {
            console.log('Security alerts enabled');
        }
        if (settings.portfolioUpdates) {
            console.log('Portfolio updates enabled');
        }
        if (settings.aiDecisions) {
            console.log('AI decision notifications enabled');
        }
    }

    connectWallet() {
        const connectBtn = document.getElementById('connectBtn');
        
        if (!this.isConnected) {
            // Simulate wallet connection
            connectBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
            connectBtn.disabled = true;
            
            setTimeout(() => {
                this.isConnected = true;
                connectBtn.innerHTML = '<i class="fas fa-wallet"></i> Connected';
                connectBtn.classList.remove('btn-primary');
                connectBtn.classList.add('btn-success');
                this.showToast('Wallet connected successfully!', 'success');
            }, 2000);
        } else {
            // Disconnect
            this.isConnected = false;
            connectBtn.innerHTML = '<i class="fas fa-wallet"></i> Connect Wallet';
            connectBtn.classList.remove('btn-success');
            connectBtn.classList.add('btn-primary');
            this.showToast('Wallet disconnected', 'info');
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        
        // Add active class to clicked item
        e.target.closest('.nav-item').classList.add('active');
        
        // Handle navigation (in real app, this would load different content)
        const target = e.target.getAttribute('href').substring(1);
        console.log('Navigating to:', target);
        
        // Show toast notification
        this.showToast(`Navigating to ${target} section`, 'info');
    }

    updateAgentMetrics() {
        // Simulate updating agent metrics
        const agents = ['perception', 'cognitive', 'action', 'learning'];
        
        agents.forEach(agent => {
            const card = document.querySelector(`.agent-card.${agent}`);
            if (card) {
                const metrics = card.querySelectorAll('.metric-value');
                
                // Update with simulated real-time data
                if (agent === 'perception') {
                    metrics[0].textContent = this.formatNumber(Math.floor(Math.random() * 500) + 1000);
                    metrics[1].textContent = (Math.random() * 20 + 30).toFixed(0) + 'ms';
                    metrics[2].textContent = (Math.random() * 2 + 97).toFixed(1) + '%';
                } else if (agent === 'cognitive') {
                    metrics[0].textContent = this.formatNumber(Math.floor(Math.random() * 20) + 80);
                    metrics[1].textContent = (Math.random() * 2 + 1).toFixed(1) + 's';
                    metrics[2].textContent = (Math.random() * 5 + 90).toFixed(1) + '%';
                } else if (agent === 'action') {
                    metrics[0].textContent = this.formatNumber(Math.floor(Math.random() * 50) + 150);
                    metrics[1].textContent = (Math.random() * 1 + 99).toFixed(1) + '%';
                    metrics[2].textContent = (Math.random() * 1 + 1.5).toFixed(1) + 's';
                } else if (agent === 'learning') {
                    metrics[0].textContent = this.formatNumber(Math.floor(Math.random() * 5) + 10);
                    metrics[1].textContent = this.formatNumber(Math.floor(Math.random() * 10) + 40);
                    metrics[2].textContent = '+' + (Math.random() * 2 + 2).toFixed(1) + '%';
                }
            }
        });
    }

    updateStats() {
        // Simulate updating dashboard stats
        const statCards = document.querySelectorAll('.stat-card');
        
        statCards.forEach(card => {
            const valueElement = card.querySelector('.stat-value');
            const changeElement = card.querySelector('.stat-change');
            
            if (valueElement && changeElement) {
                const currentValue = valueElement.textContent;
                
                if (currentValue.includes('$')) {
                    // Portfolio value
                    const currentNum = parseFloat(currentValue.replace(/[$,K]/g, ''));
                    const change = (Math.random() - 0.5) * 2;
                    const newValue = currentNum * (1 + change / 100);
                    valueElement.textContent = '$' + (newValue / 1000).toFixed(1) + 'K';
                    changeElement.textContent = (change > 0 ? '+' : '') + change.toFixed(1) + '%';
                    changeElement.className = `stat-change ${change > 0 ? 'positive' : 'negative'}`;
                } else if (currentValue.includes('%')) {
                    // Security score
                    const currentNum = parseFloat(currentValue);
                    const change = (Math.random() - 0.5) * 1;
                    const newValue = Math.max(85, Math.min(100, currentNum + change));
                    valueElement.textContent = newValue.toFixed(1);
                    changeElement.textContent = (change > 0 ? '+' : '') + change.toFixed(1) + '%';
                    changeElement.className = `stat-change ${change > 0 ? 'positive' : 'negative'}`;
                } else if (currentValue.includes('K')) {
                    // Portfolio value (K format)
                    const currentNum = parseFloat(currentValue.replace(/[K]/g, ''));
                    const change = (Math.random() - 0.5) * 2;
                    const newValue = currentNum * (1 + change / 100);
                    valueElement.textContent = newValue.toFixed(1) + 'K';
                    changeElement.textContent = (change > 0 ? '+' : '') + change.toFixed(1) + '%';
                    changeElement.className = `stat-change ${change > 0 ? 'positive' : 'negative'}`;
                }
            }
        });
    }

    simulateAgentActivity() {
        // Randomly change agent statuses
        const agents = ['perception', 'cognitive', 'action', 'learning'];
        const randomAgent = agents[Math.floor(Math.random() * agents.length)];
        
        const card = document.querySelector(`.agent-card.${randomAgent}`);
        if (card) {
            const statusBadge = card.querySelector('.status-badge');
            if (statusBadge) {
                // Temporarily show "Processing" status
                statusBadge.textContent = 'Processing';
                statusBadge.className = 'status-badge processing';
                
                setTimeout(() => {
                    statusBadge.textContent = 'Active';
                    statusBadge.className = 'status-badge active';
                }, 2000);
            }
        }
    }

    formatNumber(num) {
        return num.toLocaleString();
    }

    showToast(message, type = 'info', title = 'Aegis AI') {
        const toastContainer = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="toast-icon ${icons[type]}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // Load saved settings on init
    loadSavedSettings() {
        const saved = localStorage.getItem('aegisSettings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.applySettings(settings);
                
                // Update form values
                if (settings.aiModel) document.getElementById('aiModel').value = settings.aiModel;
                if (settings.responseSpeed) document.getElementById('responseSpeed').value = settings.responseSpeed;
                if (settings.securityAlerts !== undefined) document.getElementById('securityAlerts').checked = settings.securityAlerts;
                if (settings.portfolioUpdates !== undefined) document.getElementById('portfolioUpdates').checked = settings.portfolioUpdates;
                if (settings.aiDecisions !== undefined) document.getElementById('aiDecisions').checked = settings.aiDecisions;
            } catch (e) {
                console.error('Error loading saved settings:', e);
            }
        }
    }
}

// Initialize the interface when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aegisAI = new AegisAIInterface();
    
    // Load saved settings
    window.aegisAI.loadSavedSettings();
    
    // Add some CSS for the typing indicator
    const style = document.createElement('style');
    style.textContent = `
        .typing-dots {
            display: flex;
            gap: 4px;
            align-items: center;
        }
        
        .typing-dots span {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: var(--text-muted);
            animation: typing 1.4s infinite ease-in-out;
        }
        
        .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
        .typing-dots span:nth-child(2) { animation-delay: -0.16s; }
        
        @keyframes typing {
            0%, 80%, 100% {
                transform: scale(0);
                opacity: 0.5;
            }
            40% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .status-badge.processing {
            background: rgba(59, 130, 246, 0.1);
            color: var(--info-color);
        }
        
        .btn-success {
            background: linear-gradient(135deg, var(--success-color), #059669);
            color: white;
        }
        
        .btn-success:hover {
            transform: translateY(-1px);
            box-shadow: var(--shadow-lg);
        }
    `;
    document.head.appendChild(style);
});

// Global error handling
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (window.aegisAI) {
        window.aegisAI.showToast('An error occurred. Please refresh the page.', 'error');
    }
});

// Handle page visibility changes for real-time updates
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden, pausing real-time updates');
    } else {
        console.log('Page visible, resuming real-time updates');
    }
});
