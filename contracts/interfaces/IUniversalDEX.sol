// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IUniversalDEX
 * @dev Interface for the AEGIS Universal DEX contract
 */
interface IUniversalDEX {
    // ==================== STRUCTS ====================
    
    struct SwapParams {
        address targetToken;
        bytes recipient;
        bool withdraw;
        uint256 slippageTolerance;
    }
    
    struct GasInfo {
        address gasZRC20;
        uint256 gasFee;
        uint256 gasAmount;
    }
    
    struct SwapResult {
        uint256 inputAmount;
        uint256 outputAmount;
        uint256 gasFee;
        address gasToken;
    }
    
    // ==================== EVENTS ====================
    
    event SwapExecuted(
        uint256 indexed sourceChainId,
        address indexed inputToken,
        address indexed targetToken,
        uint256 inputAmount,
        uint256 outputAmount,
        bytes recipient,
        uint256 gasFee
    );
    
    event SwapReverted(
        address indexed asset,
        uint256 amount,
        bytes indexed recipient,
        string reason
    );
    
    event GasFeeUpdated(
        address indexed token,
        uint256 oldFee,
        uint256 newFee
    );
    
    event SwapFeeUpdated(uint256 oldFee, uint256 newFee);
    
    // ==================== CORE FUNCTIONS ====================
    
    /**
     * @dev Get swap quote for a token pair
     * @param inputToken Input token address
     * @param outputToken Output token address
     * @param inputAmount Amount of input tokens
     * @return outputAmount Expected output amount
     * @return gasFee Gas fee for destination chain
     */
    function getSwapQuote(
        address inputToken,
        address outputToken,
        uint256 inputAmount
    ) external view returns (uint256 outputAmount, uint256 gasFee);
    
    /**
     * @dev Get gas fee information for a token
     * @param token Token address
     * @return gasToken Gas token address for the chain
     * @return fee Gas fee amount
     */
    function getGasFee(address token) external view returns (address gasToken, uint256 fee);
    
    /**
     * @dev Check if a chain is Bitcoin
     * @param chainId Chain ID to check
     * @return True if the chain is Bitcoin
     */
    function isBitcoinChain(uint256 chainId) external pure returns (bool);
    
    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @dev Update swap fee
     * @param newFee New swap fee in basis points
     */
    function setSwapFee(uint256 newFee) external;
    
    /**
     * @dev Update gas fee buffer
     * @param newBuffer New gas fee buffer percentage
     */
    function setGasFeeBuffer(uint256 newBuffer) external;
    
    /**
     * @dev Update Uniswap router
     * @param newRouter New router address
     */
    function setUniswapRouter(address newRouter) external;
    
    /**
     * @dev Update price oracle
     * @param newOracle New oracle address
     */
    function setPriceOracle(address newOracle) external;
    
    /**
     * @dev Emergency withdraw tokens
     * @param token Token address
     * @param recipient Recipient address
     * @param amount Amount to withdraw
     */
    function emergencyWithdraw(
        address token,
        address recipient,
        uint256 amount
    ) external;
    
    // ==================== VIEW FUNCTIONS ====================
    
    /**
     * @dev Get Uniswap router address
     */
    function uniswapRouter() external view returns (address);
    
    /**
     * @dev Get price oracle address
     */
    function priceOracle() external view returns (address);
    
    /**
     * @dev Get current swap fee
     */
    function swapFee() external view returns (uint256);
    
    /**
     * @dev Get current gas fee buffer
     */
    function gasFeeBuffer() external view returns (uint256);
    
    /**
     * @dev Get owner address
     */
    function owner() external view returns (address);
    
    // ==================== CONSTANTS ====================
    
    /**
     * @dev Bitcoin mainnet chain ID
     */
    function BITCOIN_MAINNET() external pure returns (uint256);
    
    /**
     * @dev Bitcoin testnet chain ID
     */
    function BITCOIN_TESTNET() external pure returns (uint256);
    
    /**
     * @dev Default gas limit for cross-chain operations
     */
    function DEFAULT_GAS_LIMIT() external pure returns (uint256);
} 