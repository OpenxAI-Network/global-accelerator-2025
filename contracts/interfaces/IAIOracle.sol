// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IAIOracle
 * @dev Interface for AI-powered oracle that provides risk assessment and liquidation triggers
 */
interface IAIOracle {
    /**
     * @dev Get risk profile for a specific asset on a specific chain
     * @param chainId The chain ID where the asset is located
     * @param asset The address of the asset
     * @return maxLTV Maximum Loan-to-Value ratio (in basis points, 100 = 1%)
     * @return liquidationThreshold Threshold for liquidation (in basis points)
     * @return volatilityScore Volatility score (0-100, higher = more volatile)
     */
    function getRiskProfile(uint256 chainId, address asset) 
        external 
        returns (
            uint256 maxLTV,
            uint256 liquidationThreshold,
            uint256 volatilityScore
        );

    /**
     * @dev Request liquidation of a specific loan
     * @param contractAddr The address of the lending contract
     * @param loanId The ID of the loan to liquidate
     * @param severity The severity level of the liquidation (1-10)
     */
    function requestLiquidation(
        address contractAddr, 
        uint256 loanId, 
        uint256 severity
    ) external;

    /**
     * @dev Get real-time price for an asset
     * @param chainId The chain ID where the asset is located
     * @param asset The address of the asset
     * @return price The current price in USD (with 8 decimals)
     * @return timestamp The timestamp when the price was last updated
     */
    function getAssetPrice(uint256 chainId, address asset) 
        external 
        returns (
            uint256 price,
            uint256 timestamp
        );

    /**
     * @dev Check if a position should be liquidated
     * @param collateralValue The current value of the collateral
     * @param debtValue The current value of the debt
     * @param liquidationThreshold The liquidation threshold for the asset
     * @return shouldLiquidate True if the position should be liquidated
     * @return healthFactor The health factor of the position
     */
    function shouldLiquidate(
        uint256 collateralValue,
        uint256 debtValue,
        uint256 liquidationThreshold
    ) external pure returns (bool shouldLiquidate, uint256 healthFactor);
} 