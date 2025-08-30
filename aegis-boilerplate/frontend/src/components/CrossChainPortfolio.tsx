import React, { useState, useEffect, useMemo } from 'react';
import { useSWR } from 'swr';
import { PortfolioPosition, ChainSummary } from '../types/portfolio';
import { useWallet } from '../hooks/useWallet';

interface CrossChainPortfolioProps {
  onPositionClick?: (position: PortfolioPosition) => void;
  onChainClick?: (chainId: number) => void;
}

const CrossChainPortfolio: React.FC<CrossChainPortfolioProps> = ({
  onPositionClick,
  onChainClick
}) => {
  const { connectedWallets } = useWallet();
  const [selectedChain, setSelectedChain] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'value' | 'health' | 'chain' | 'name'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards' | 'chart'>('table');

  // Fetch portfolio data using SWR
  const { data: portfolioData, error, mutate } = useSWR(
    connectedWallets.length > 0 ? '/api/portfolio/positions' : null,
    fetcher,
    { refreshInterval: 30000 } // Refresh every 30 seconds
  );

  // Filter positions by selected chain
  const filteredPositions = useMemo(() => {
    if (!portfolioData?.positions) return [];
    
    let positions = portfolioData.positions;
    if (selectedChain !== null) {
      positions = positions.filter(p => p.chainId === selectedChain);
    }
    
    // Sort positions
    positions.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'value':
          aValue = a.totalValue;
          bValue = b.totalValue;
          break;
        case 'health':
          aValue = a.healthScore;
          bValue = b.healthScore;
          break;
        case 'chain':
          aValue = a.chainName;
          bValue = b.chainName;
          break;
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
    
    return positions;
  }, [portfolioData, selectedChain, sortBy, sortOrder]);

  // Calculate portfolio summary
  const portfolioSummary = useMemo(() => {
    if (!portfolioData?.positions) return null;
    
    const positions = portfolioData.positions;
    const totalValue = positions.reduce((sum, p) => sum + p.totalValue, 0);
    const totalBorrowed = positions.reduce((sum, p) => sum + p.borrowedValue, 0);
    const totalCollateral = positions.reduce((sum, p) => sum + p.collateralValue, 0);
    const averageHealth = positions.reduce((sum, p) => sum + p.healthScore, 0) / positions.length;
    
    // Group by chain
    const chainSummary: { [chainId: number]: ChainSummary } = {};
    positions.forEach(position => {
      if (!chainSummary[position.chainId]) {
        chainSummary[position.chainId] = {
          chainId: position.chainId,
          chainName: position.chainName,
          totalValue: 0,
          totalBorrowed: 0,
          totalCollateral: 0,
          positionCount: 0,
          averageHealth: 0
        };
      }
      
      chainSummary[position.chainId].totalValue += position.totalValue;
      chainSummary[position.chainId].totalBorrowed += position.borrowedValue;
      chainSummary[position.chainId].totalCollateral += position.collateralValue;
      chainSummary[position.chainId].positionCount += 1;
    });
    
    // Calculate average health per chain
    Object.values(chainSummary).forEach(chain => {
      const chainPositions = positions.filter(p => p.chainId === chain.chainId);
      chain.averageHealth = chainPositions.reduce((sum, p) => sum + p.healthScore, 0) / chainPositions.length;
    });
    
    return {
      totalValue,
      totalBorrowed,
      totalCollateral,
      averageHealth,
      chainSummary: Object.values(chainSummary),
      positionCount: positions.length
    };
  }, [portfolioData]);

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleChainFilter = (chainId: number | null) => {
    setSelectedChain(chainId);
  };

  const formatUSD = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(2)}%`;
  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (error) {
    return (
      <div className="portfolio-error">
        <div className="error-icon">❌</div>
        <h3>Failed to load portfolio</h3>
        <p>{error.message}</p>
        <button onClick={() => mutate()} className="btn-retry">
          Retry
        </button>
      </div>
    );
  }

  if (!portfolioData) {
    return (
      <div className="portfolio-loading">
        <div className="loading-spinner"></div>
        <p>Loading portfolio data...</p>
      </div>
    );
  }

  return (
    <div className="cross-chain-portfolio">
      {/* Portfolio Header */}
      <div className="portfolio-header">
        <div className="portfolio-title">
          <h2>Cross-Chain Portfolio</h2>
          <div className="portfolio-stats">
            <span className="stat">
              <span className="stat-label">Total Value:</span>
              <span className="stat-value">
                {portfolioSummary ? formatUSD(portfolioSummary.totalValue) : '...'}
              </span>
            </span>
            <span className="stat">
              <span className="stat-label">Positions:</span>
              <span className="stat-value">{portfolioSummary?.positionCount || 0}</span>
            </span>
            <span className="stat">
              <span className="stat-label">Avg Health:</span>
              <span className={`stat-value ${portfolioSummary ? getHealthColor(portfolioSummary.averageHealth) : ''}`}>
                {portfolioSummary ? formatPercentage(portfolioSummary.averageHealth) : '...'}
              </span>
            </span>
          </div>
        </div>
        
        <div className="portfolio-controls">
          <div className="view-mode-toggle">
            <button
              onClick={() => setViewMode('table')}
              className={`btn-toggle ${viewMode === 'table' ? 'active' : ''}`}
            >
              📊 Table
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`btn-toggle ${viewMode === 'cards' ? 'active' : ''}`}
            >
              🃏 Cards
            </button>
            <button
              onClick={() => setViewMode('chart')}
              className={`btn-toggle ${viewMode === 'chart' ? 'active' : ''}`}
            >
              📈 Chart
            </button>
          </div>
          
          <button onClick={() => mutate()} className="btn-refresh">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Chain Filter */}
      <div className="chain-filter">
        <button
          onClick={() => handleChainFilter(null)}
          className={`chain-filter-btn ${selectedChain === null ? 'active' : ''}`}
        >
          All Chains
        </button>
        {portfolioSummary?.chainSummary.map(chain => (
          <button
            key={chain.chainId}
            onClick={() => handleChainFilter(chain.chainId)}
            className={`chain-filter-btn ${selectedChain === chain.chainId ? 'active' : ''}`}
          >
            {chain.chainName} ({chain.positionCount})
          </button>
        ))}
      </div>

      {/* Portfolio Content */}
      <div className="portfolio-content">
        {viewMode === 'table' && (
          <div className="portfolio-table">
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="sortable">
                    Position Name
                    {sortBy === 'name' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th onClick={() => handleSort('chain')} className="sortable">
                    Chain
                    {sortBy === 'chain' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th onClick={() => handleSort('value')} className="sortable">
                    Total Value
                    {sortBy === 'value' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th>Borrowed</th>
                  <th>Collateral</th>
                  <th onClick={() => handleSort('health')} className="sortable">
                    Health Score
                    {sortBy === 'health' && <span className="sort-indicator">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPositions.map(position => (
                  <tr key={position.id} onClick={() => onPositionClick?.(position)}>
                    <td className="position-name">
                      <span className="position-icon">{position.icon}</span>
                      {position.name}
                    </td>
                    <td className="chain-name">
                      <span className="chain-icon">{position.chainIcon}</span>
                      {position.chainName}
                    </td>
                    <td className="total-value">{formatUSD(position.totalValue)}</td>
                    <td className="borrowed-value">{formatUSD(position.borrowedValue)}</td>
                    <td className="collateral-value">{formatUSD(position.collateralValue)}</td>
                    <td className={`health-score ${getHealthColor(position.healthScore)}`}>
                      {formatPercentage(position.healthScore)}
                    </td>
                    <td className="actions">
                      <button className="btn-action">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'cards' && (
          <div className="portfolio-cards">
            {filteredPositions.map(position => (
              <div 
                key={position.id} 
                className="position-card"
                onClick={() => onPositionClick?.(position)}
              >
                <div className="card-header">
                  <span className="position-icon">{position.icon}</span>
                  <span className="position-name">{position.name}</span>
                  <span className={`health-badge ${getHealthColor(position.healthScore)}`}>
                    {formatPercentage(position.healthScore)}
                  </span>
                </div>
                
                <div className="card-chain">
                  <span className="chain-icon">{position.chainIcon}</span>
                  <span className="chain-name">{position.chainName}</span>
                </div>
                
                <div className="card-metrics">
                  <div className="metric">
                    <span className="metric-label">Total Value</span>
                    <span className="metric-value">{formatUSD(position.totalValue)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Borrowed</span>
                    <span className="metric-value">{formatUSD(position.borrowedValue)}</span>
                  </div>
                  <div className="metric">
                    <span className="metric-label">Collateral</span>
                    <span className="metric-value">{formatUSD(position.collateralValue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'chart' && (
          <div className="portfolio-chart">
            <div className="chart-placeholder">
              <h3>Portfolio Chart View</h3>
              <p>Chart visualization would be implemented here using a library like Chart.js or Recharts</p>
              <p>Showing data for {filteredPositions.length} positions</p>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {filteredPositions.length === 0 && (
        <div className="portfolio-empty">
          <div className="empty-icon">📊</div>
          <h3>No positions found</h3>
          <p>
            {selectedChain !== null 
              ? `No positions found on the selected chain.`
              : 'Connect your wallets to see your portfolio positions.'
            }
          </p>
          {selectedChain !== null && (
            <button 
              onClick={() => handleChainFilter(null)}
              className="btn-clear-filter"
            >
              Clear Filter
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.statusText}`);
  }
  return response.json();
};

export default CrossChainPortfolio;
