// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IAIOracle.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockAIOracle
 * @dev Mock implementation of AI Oracle for testing purposes
 * In production, this would be replaced with a real AI oracle service
 */
contract MockAIOracle is IAIOracle, Ownable {
    // Mock price data (in USD with 8 decimals)
    mapping(address => mapping(uint256 => uint256)) public mockPrices;
    
    // Mock risk profiles
    mapping(address => mapping(uint256 => uint256)) public mockMaxLTV;
    mapping(address => mapping(uint256 => uint256)) public mockLiquidationThreshold;
    mapping(address => mapping(uint256 => uint256)) public mockVolatilityScore;
    
    // Events
    event MockPriceSet(address indexed asset, uint256 indexed chainId, uint256 price);
    event MockRiskProfileSet(
        address indexed asset, 
        uint256 indexed chainId, 
        uint256 maxLTV, 
        uint256 liquidationThreshold, 
        uint256 volatilityScore
    );
    
    constructor() Ownable(msg.sender) {}
    
    // ==================== MOCK DATA SETTERS ====================
    
    function setMockPrice(
        address asset, 
        uint256 chainId, 
        uint256 price
    ) external onlyOwner {
        mockPrices[asset][chainId] = price;
        emit MockPriceSet(asset, chainId, price);
    }
    
    function setMockRiskProfile(
        address asset,
        uint256 chainId,
        uint256 maxLTV,
        uint256 liquidationThreshold,
        uint256 volatilityScore
    ) external onlyOwner {
        require(maxLTV <= 10000, "Invalid maxLTV");
        require(
            liquidationThreshold >= 8000 && liquidationThreshold <= 9500,
            "Invalid liquidation threshold"
        );
        require(volatilityScore <= 100, "Invalid volatility score");
        
        mockMaxLTV[asset][chainId] = maxLTV;
        mockLiquidationThreshold[asset][chainId] = liquidationThreshold;
        mockVolatilityScore[asset][chainId] = volatilityScore;
        
        emit MockRiskProfileSet(asset, chainId, maxLTV, liquidationThreshold, volatilityScore);
    }
    
    // ==================== IAIOracle IMPLEMENTATION ====================
    
    function getRiskProfile(uint256 chainId, address asset) 
        external 
        view 
        override 
        returns (
            uint256 maxLTV,
            uint256 liquidationThreshold,
            uint256 volatilityScore
        ) 
    {
        maxLTV = mockMaxLTV[asset][chainId];
        liquidationThreshold = mockLiquidationThreshold[asset][chainId];
        volatilityScore = mockVolatilityScore[asset][chainId];
        
        // Return default values if not set
        if (maxLTV == 0) maxLTV = 7500; // 75% default
        if (liquidationThreshold == 0) liquidationThreshold = 8500; // 85% default
        if (volatilityScore == 0) volatilityScore = 50; // Medium volatility default
    }
    
    function requestLiquidation(
        address contractAddr, 
        uint256 loanId, 
        uint256 severity
    ) external override {
        // In a real implementation, this would trigger the liquidation process
        // For now, we just emit an event
        emit LiquidationRequested(contractAddr, loanId, severity);
    }
    
    function getAssetPrice(uint256 chainId, address asset) 
        external 
        view 
        override 
        returns (
            uint256 price,
            uint256 timestamp
        ) 
    {
        price = mockPrices[asset][chainId];
        if (price == 0) {
            // Default prices for common tokens
            if (asset == address(0)) { // ETH
                price = 2000000000; // $2000
            } else if (asset == address(1)) { // USDC
                price = 100000000; // $1.00
            } else if (asset == address(2)) { // BTC
                price = 40000000000; // $40000
            } else {
                price = 100000000; // $1.00 default
            }
        }
        timestamp = block.timestamp;
    }
    
    function shouldLiquidate(
        uint256 collateralValue,
        uint256 debtValue,
        uint256 liquidationThreshold
    ) external pure override returns (bool shouldLiquidate, uint256 healthFactor) {
        if (debtValue == 0) {
            return (false, type(uint256).max);
        }
        
        healthFactor = (collateralValue * liquidationThreshold) / (debtValue * 10000);
        shouldLiquidate = healthFactor < 10000; // Below 100% = liquidate
        
        return (shouldLiquidate, healthFactor);
    }
    
    // ==================== BATCH OPERATIONS ====================
    
    function setBatchMockPrices(
        address[] calldata assets,
        uint256[] calldata chainIds,
        uint256[] calldata prices
    ) external onlyOwner {
        require(
            assets.length == chainIds.length && 
            chainIds.length == prices.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < assets.length; i++) {
            mockPrices[assets[i]][chainIds[i]] = prices[i];
            emit MockPriceSet(assets[i], chainIds[i], prices[i]);
        }
    }
    
    function setBatchRiskProfiles(
        address[] calldata assets,
        uint256[] calldata chainIds,
        uint256[] calldata maxLTVs,
        uint256[] calldata liquidationThresholds,
        uint256[] calldata volatilityScores
    ) external onlyOwner {
        require(
            assets.length == chainIds.length && 
            chainIds.length == maxLTVs.length &&
            maxLTVs.length == liquidationThresholds.length &&
            liquidationThresholds.length == volatilityScores.length,
            "Array lengths must match"
        );
        
        for (uint256 i = 0; i < assets.length; i++) {
            setMockRiskProfile(
                assets[i],
                chainIds[i],
                maxLTVs[i],
                liquidationThresholds[i],
                volatilityScores[i]
            );
        }
    }
    
    // ==================== EVENTS ====================
    
    event LiquidationRequested(
        address indexed contractAddr,
        uint256 indexed loanId,
        uint256 severity
    );
} 