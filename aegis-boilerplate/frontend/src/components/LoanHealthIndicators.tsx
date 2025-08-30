import React, { useState, useEffect, useMemo } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { LoanHealthStatus, PositionHealth } from '../types/loans';

interface LoanHealthIndicatorsProps {
  positions: PositionHealth[];
  onHealthAlert?: (alert: { type: 'warning' | 'danger' | 'info'; message: string }) => void;
}

const LoanHealthIndicators: React.FC<LoanHealthIndicatorsProps> = ({
  positions,
  onHealthAlert
}) => {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // WebSocket connection for real-time updates
  const { 
    isConnected, 
    lastMessage, 
    sendMessage 
  } = useWebSocket(process.env.REACT_APP_WEBSOCKET_URL || 'ws://localhost:3001');

  // Process real-time updates
  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        if (data.type === 'position_update') {
          setLastUpdate(new Date());
          
          // Check for health alerts
          if (data.healthStatus === 'danger' && onHealthAlert) {
            onHealthAlert({
              type: 'danger',
              message: `Position ${data.positionId} is at risk! LTV: ${data.ltv}%`
            });
          } else if (data.healthStatus === 'warning' && onHealthAlert) {
            onHealthAlert({
              type: 'warning',
              message: `Position ${data.positionId} needs attention. LTV: ${data.ltv}%`
            });
          }
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    }
  }, [lastMessage, onHealthAlert]);

  // Calculate overall portfolio health
  const portfolioHealth = useMemo(() => {
    if (positions.length === 0) return 'healthy';

    const criticalPositions = positions.filter(p => p.status === LoanHealthStatus.CRITICAL).length;
    const warningPositions = positions.filter(p => p.status === LoanHealthStatus.WARNING).length;
    const healthyPositions = positions.filter(p => p.status === LoanHealthStatus.HEALTHY).length;

    if (criticalPositions > 0) return 'critical';
    if (warningPositions > 0) return 'warning';
    return 'healthy';
  }, [positions]);

  // Get health status icon and color
  const getHealthDisplay = (status: LoanHealthStatus) => {
    switch (status) {
      case LoanHealthStatus.HEALTHY:
        return { icon: '🟢', color: 'text-green-600', bgColor: 'bg-green-50' };
      case LoanHealthStatus.WARNING:
        return { icon: '🟡', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
      case LoanHealthStatus.CRITICAL:
        return { icon: '🔴', color: 'text-red-600', bgColor: 'bg-red-50' };
      case LoanHealthStatus.LIQUIDATION:
        return { icon: '💀', color: 'text-red-800', bgColor: 'bg-red-100' };
      default:
        return { icon: '⚪', color: 'text-gray-600', bgColor: 'bg-gray-50' };
    }
  };

  const getPortfolioHealthDisplay = () => {
    switch (portfolioHealth) {
      case 'healthy':
        return { icon: '🟢', text: 'Portfolio Healthy', color: 'text-green-600' };
      case 'warning':
        return { icon: '🟡', text: 'Portfolio Needs Attention', color: 'text-yellow-600' };
      case 'critical':
        return { icon: '🔴', text: 'Portfolio At Risk', color: 'text-red-600' };
      default:
        return { icon: '⚪', text: 'Portfolio Status Unknown', color: 'text-gray-600' };
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Send refresh request via WebSocket
      sendMessage(JSON.stringify({ type: 'refresh_positions' }));
      
      // Also trigger a manual refresh via API
      // await refreshPositions();
    } catch (err) {
      console.error('Failed to refresh positions:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatLTV = (ltv: number) => `${ltv.toFixed(2)}%`;
  const formatUSD = (amount: number) => `$${amount.toLocaleString()}`;

  return (
    <div className="loan-health-indicators">
      <div className="health-header">
        <div className="health-title">
          <h3>Loan Health Status</h3>
          <div className={`portfolio-status ${getPortfolioHealthDisplay().color}`}>
            <span className="status-icon">{getPortfolioHealthDisplay().icon}</span>
            <span className="status-text">{getPortfolioHealthDisplay().text}</span>
          </div>
        </div>
        
        <div className="health-actions">
          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
            <span className="status-text">
              {isConnected ? 'Live Updates' : 'Offline'}
            </span>
          </div>
          
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || !isConnected}
            className="btn-refresh"
          >
            {isRefreshing ? '🔄' : '🔄'} Refresh
          </button>
        </div>
      </div>

      <div className="health-summary">
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Total Positions</span>
            <span className="stat-value">{positions.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Healthy</span>
            <span className="stat-value text-green-600">
              {positions.filter(p => p.status === LoanHealthStatus.HEALTHY).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Warning</span>
            <span className="stat-value text-yellow-600">
              {positions.filter(p => p.status === LoanHealthStatus.WARNING).length}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Critical</span>
            <span className="stat-value text-red-600">
              {positions.filter(p => p.status === LoanHealthStatus.CRITICAL).length}
            </span>
          </div>
        </div>
        
        <div className="last-update">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      <div className="positions-list">
        {positions.length === 0 ? (
          <div className="no-positions">
            <p>No active positions found</p>
            <p className="text-sm text-gray-500">
              Connect your wallets to see your loan positions
            </p>
          </div>
        ) : (
          positions.map((position) => {
            const healthDisplay = getHealthDisplay(position.status);
            
            return (
              <div 
                key={position.id} 
                className={`position-item ${healthDisplay.bgColor}`}
              >
                <div className="position-header">
                  <div className="position-info">
                    <span className="position-icon">{healthDisplay.icon}</span>
                    <div className="position-details">
                      <span className="position-name">{position.name}</span>
                      <span className="position-chain">{position.chainName}</span>
                    </div>
                  </div>
                  
                  <div className="position-health">
                    <span className={`health-status ${healthDisplay.color}`}>
                      {position.status}
                    </span>
                  </div>
                </div>
                
                <div className="position-metrics">
                  <div className="metric">
                    <span className="metric-label">LTV</span>
                    <span className={`metric-value ${position.ltv > 80 ? 'text-red-600' : position.ltv > 70 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {formatLTV(position.ltv)}
                    </span>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-label">Borrowed</span>
                    <span className="metric-value">{formatUSD(position.borrowedAmount)}</span>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-label">Collateral</span>
                    <span className="metric-value">{formatUSD(position.collateralValue)}</span>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-label">Health Score</span>
                    <span className={`metric-value ${position.healthScore > 80 ? 'text-green-600' : position.healthScore > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {position.healthScore}/100
                    </span>
                  </div>
                </div>
                
                {position.status === LoanHealthStatus.CRITICAL && (
                  <div className="position-alert">
                    <span className="alert-icon">⚠️</span>
                    <span className="alert-text">
                      This position is at risk of liquidation. Consider adding collateral or repaying debt.
                    </span>
                  </div>
                )}
                
                {position.status === LoanHealthStatus.WARNING && (
                  <div className="position-alert">
                    <span className="alert-icon">💡</span>
                    <span className="alert-text">
                      Monitor this position closely. LTV is approaching risk threshold.
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default LoanHealthIndicators;
