// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@zetachain/protocol-contracts/contracts/zevm/UniversalContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol";
import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UniversalDEX
 * @dev Universal Decentralized Exchange for cross-chain token swaps on ZetaChain
 * 
 * Features:
 * - Cross-chain token swaps via Universal Contract pattern
 * - Automatic gas fee handling for destination chains
 * - Uniswap V2 integration for token swaps
 * - Bitcoin-compatible message decoding
 * - Automatic refund handling for failed transactions
 */
contract UniversalDEX is UniversalContract, ReentrancyGuard, Ownable {
    using SafeERC20 for IZRC20;
    
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
    
    // ==================== STATE VARIABLES ====================
    
    address public uniswapRouter;
    address public priceOracle;
    
    // Swap fees (in basis points)
    uint256 public swapFee = 30; // 0.3%
    uint256 public constant MAX_SWAP_FEE = 100; // 1%
    
    // Gas fee buffer (extra gas to ensure successful withdrawal)
    uint256 public gasFeeBuffer = 20; // 20% buffer
    
    // Bitcoin chain IDs
    uint256 public constant BITCOIN_MAINNET = 8332;
    uint256 public constant BITCOIN_TESTNET = 18332;
    
    // Gas limit for cross-chain operations
    uint256 public constant DEFAULT_GAS_LIMIT = 300000;
    
    // Events
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
    
    // ==================== MODIFIERS ====================
    
    modifier onlyGateway() {
        require(msg.sender == address(systemContract), "Only gateway");
        _;
    }
    
    modifier validSlippage(uint256 slippage) {
        require(slippage <= 1000, "Invalid slippage"); // Max 10%
        _;
    }
    
    // ==================== CONSTRUCTOR ====================
    
    constructor(
        address systemContract,
        address _uniswapRouter,
        address _priceOracle
    ) UniversalContract(systemContract) {
        uniswapRouter = _uniswapRouter;
        priceOracle = _priceOracle;
    }
    
    // ==================== UNIVERSAL CONTRACT IMPLEMENTATION ====================
    
    /**
     * @dev Main entry point for cross-chain swaps
     * @param context Message context from ZetaChain
     * @param zrc20 Input ZRC-20 token address
     * @param amount Amount of input tokens
     * @param message Encoded swap parameters
     */
    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlyGateway {
        // Decode swap parameters
        SwapParams memory params = _decodeMessage(context.chainID, message);
        
        // Validate parameters
        require(params.targetToken != address(0), "Invalid target token");
        require(params.recipient.length > 0, "Invalid recipient");
        require(amount > 0, "Invalid amount");
        
        // Execute swap
        SwapResult memory result = _executeSwap(
            zrc20,
            amount,
            params.targetToken,
            params.slippageTolerance
        );
        
        if (params.withdraw) {
            // Withdraw to destination chain
            _withdrawToDestination(
                params.recipient,
                result.outputAmount,
                params.targetToken,
                context.sender,
                zrc20,
                result.gasFee
            );
        } else {
            // Keep on ZetaChain - transfer to recipient
            IZRC20(params.targetToken).safeTransfer(
                _bytesToAddress(params.recipient),
                result.outputAmount
            );
        }
        
        emit SwapExecuted(
            context.chainID,
            zrc20,
            params.targetToken,
            result.inputAmount,
            result.outputAmount,
            params.recipient,
            result.gasFee
        );
    }
    
    /**
     * @dev Handle failed cross-chain withdrawals
     * @param asset Asset that failed to withdraw
     * @param amount Amount of failed asset
     * @param revertMessage Encoded revert information
     */
    function onRevert(
        address asset,
        uint256 amount,
        bytes calldata revertMessage
    ) external override onlyGateway {
        // Decode revert message: (sender, originalToken, gasFee)
        (bytes memory sender, address originalToken, uint256 gasFee) = abi.decode(
            revertMessage,
            (bytes, address, uint256)
        );
        
        // Swap failed asset back to original token
        uint256 refundAmount = _swapToOriginalToken(
            asset,
            amount,
            originalToken
        );
        
        // Withdraw refund to original sender
        _withdrawRefund(sender, refundAmount, originalToken, gasFee);
        
        emit SwapReverted(asset, amount, sender, "Withdrawal failed");
    }
    
    // ==================== CORE SWAP LOGIC ====================
    
    /**
     * @dev Execute the core swap logic
     */
    function _executeSwap(
        address inputToken,
        uint256 inputAmount,
        address targetToken,
        uint256 slippageTolerance
    ) internal returns (SwapResult memory result) {
        result.inputAmount = inputAmount;
        
        // Get gas fee information for target token
        GasInfo memory gasInfo = _getGasInfo(targetToken);
        result.gasFee = gasInfo.gasFee;
        result.gasToken = gasInfo.gasZRC20;
        
        // Calculate amounts for gas and swap
        uint256 amountForGas = 0;
        uint256 amountForSwap = inputAmount;
        
        if (inputToken != gasInfo.gasZRC20) {
            // Need to swap some input tokens for gas
            amountForGas = _calculateGasAmount(inputToken, gasInfo.gasZRC20, gasInfo.gasFee);
            amountForSwap = inputAmount - amountForGas;
            
            // Swap input tokens for gas tokens
            if (amountForGas > 0) {
                _swapTokens(inputToken, gasInfo.gasZRC20, amountForGas, 0);
            }
        } else {
            // Input token is gas token
            amountForGas = gasInfo.gasFee;
            amountForSwap = inputAmount - amountForGas;
        }
        
        // Swap remaining tokens to target token
        if (amountForSwap > 0) {
            result.outputAmount = _swapTokens(
                inputToken,
                targetToken,
                amountForSwap,
                slippageTolerance
            );
        } else {
            result.outputAmount = 0;
        }
        
        // Apply swap fee
        uint256 feeAmount = (result.outputAmount * swapFee) / 10000;
        result.outputAmount -= feeAmount;
        
        return result;
    }
    
    /**
     * @dev Get gas fee information for a token
     */
    function _getGasInfo(address token) internal view returns (GasInfo memory) {
        (address gasZRC20, uint256 gasFee) = IZRC20(token).withdrawGasFee();
        
        // Apply gas fee buffer
        uint256 gasAmount = gasFee + (gasFee * gasFeeBuffer) / 100;
        
        return GasInfo({
            gasZRC20: gasZRC20,
            gasFee: gasFee,
            gasAmount: gasAmount
        });
    }
    
    /**
     * @dev Calculate amount of input tokens needed for gas
     */
    function _calculateGasAmount(
        address inputToken,
        address gasToken,
        uint256 gasFee
    ) internal view returns (uint256) {
        if (inputToken == gasToken) {
            return gasFee;
        }
        
        // Get price from oracle or calculate from reserves
        // For simplicity, we'll use a 1:1 ratio here
        // In production, this should query a price oracle
        return gasFee;
    }
    
    /**
     * @dev Execute token swap via Uniswap V2
     */
    function _swapTokens(
        address inputToken,
        address outputToken,
        uint256 inputAmount,
        uint256 slippageTolerance
    ) internal returns (uint256 outputAmount) {
        // Approve router to spend input tokens
        IZRC20(inputToken).safeApprove(uniswapRouter, inputAmount);
        
        // Calculate minimum output amount
        uint256 minOutputAmount = _getExpectedOutput(
            inputToken,
            outputToken,
            inputAmount
        );
        
        if (slippageTolerance > 0) {
            minOutputAmount = minOutputAmount * (10000 - slippageTolerance) / 10000;
        }
        
        // Execute swap
        address[] memory path = new address[](2);
        path[0] = inputToken;
        path[1] = outputToken;
        
        uint256[] memory amounts = IUniswapV2Router02(uniswapRouter).swapExactTokensForTokens(
            inputAmount,
            minOutputAmount,
            path,
            address(this),
            block.timestamp
        );
        
        return amounts[1];
    }
    
    /**
     * @dev Get expected output amount for a swap
     */
    function _getExpectedOutput(
        address inputToken,
        address outputToken,
        uint256 inputAmount
    ) internal view returns (uint256) {
        address[] memory path = new address[](2);
        path[0] = inputToken;
        path[1] = outputToken;
        
        uint256[] memory amounts = IUniswapV2Router02(uniswapRouter).getAmountsOut(
            inputAmount,
            path
        );
        
        return amounts[1];
    }
    
    // ==================== CROSS-CHAIN OPERATIONS ====================
    
    /**
     * @dev Withdraw tokens to destination chain
     */
    function _withdrawToDestination(
        bytes memory recipient,
        uint256 amount,
        address targetToken,
        bytes memory sender,
        address inputToken,
        uint256 gasFee
    ) internal {
        // Prepare revert options for failed withdrawals
        bytes memory revertMessage = abi.encode(sender, inputToken, gasFee);
        
        // Withdraw target tokens to destination chain
        IZRC20(targetToken).withdraw(
            recipient,
            amount,
            abi.encode(
                address(this), // revertAddress
                true,          // callOnRevert
                address(0),    // abortAddress
                revertMessage, // revertMessage
                DEFAULT_GAS_LIMIT // onRevertGasLimit
            )
        );
    }
    
    /**
     * @dev Withdraw refund to original sender
     */
    function _withdrawRefund(
        bytes memory sender,
        uint256 amount,
        address token,
        uint256 gasFee
    ) internal {
        // Withdraw refund to original sender
        IZRC20(token).withdraw(
            sender,
            amount,
            abi.encode(
                address(this), // revertAddress
                false,         // callOnRevert
                address(0),    // abortAddress
                "",            // revertMessage
                DEFAULT_GAS_LIMIT // onRevertGasLimit
            )
        );
    }
    
    /**
     * @dev Swap failed asset back to original token
     */
    function _swapToOriginalToken(
        address failedAsset,
        uint256 amount,
        address originalToken
    ) internal returns (uint256) {
        if (failedAsset == originalToken) {
            return amount;
        }
        
        // Swap failed asset back to original token
        return _swapTokens(failedAsset, originalToken, amount, 0);
    }
    
    // ==================== MESSAGE DECODING ====================
    
    /**
     * @dev Decode swap message based on chain type
     */
    function _decodeMessage(
        uint256 chainId,
        bytes calldata message
    ) internal pure returns (SwapParams memory params) {
        if (chainId == BITCOIN_MAINNET || chainId == BITCOIN_TESTNET) {
            // Bitcoin compact format: [20 bytes token][recipient][1 byte withdraw][1 byte slippage]
            require(message.length >= 42, "Invalid Bitcoin message length");
            
            params.targetToken = _bytesToAddress(message, 0);
            params.recipient = message[20:message.length-2];
            params.withdraw = message[message.length-2] != 0;
            params.slippageTolerance = uint256(uint8(message[message.length-1])) * 100; // Convert to basis points
        } else {
            // EVM chains: use ABI decoding
            (address targetToken, bytes memory recipient, bool withdraw, uint256 slippage) = abi.decode(
                message,
                (address, bytes, bool, uint256)
            );
            
            params.targetToken = targetToken;
            params.recipient = recipient;
            params.withdraw = withdraw;
            params.slippageTolerance = slippage;
        }
    }
    
    /**
     * @dev Convert bytes to address
     */
    function _bytesToAddress(bytes memory b, uint256 start) internal pure returns (address) {
        require(b.length >= start + 20, "Invalid bytes length");
        address addr;
        assembly {
            addr := mload(add(add(b, 20), start))
        }
        return addr;
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @dev Update swap fee
     */
    function setSwapFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_SWAP_FEE, "Fee too high");
        uint256 oldFee = swapFee;
        swapFee = newFee;
        emit SwapFeeUpdated(oldFee, newFee);
    }
    
    /**
     * @dev Update gas fee buffer
     */
    function setGasFeeBuffer(uint256 newBuffer) external onlyOwner {
        require(newBuffer <= 100, "Buffer too high"); // Max 100%
        gasFeeBuffer = newBuffer;
    }
    
    /**
     * @dev Update Uniswap router
     */
    function setUniswapRouter(address newRouter) external onlyOwner {
        require(newRouter != address(0), "Invalid router");
        uniswapRouter = newRouter;
    }
    
    /**
     * @dev Update price oracle
     */
    function setPriceOracle(address newOracle) external onlyOwner {
        require(newOracle != address(0), "Invalid oracle");
        priceOracle = newOracle;
    }
    
    /**
     * @dev Emergency withdraw tokens
     */
    function emergencyWithdraw(
        address token,
        address recipient,
        uint256 amount
    ) external onlyOwner {
        IZRC20(token).safeTransfer(recipient, amount);
    }
    
    // ==================== VIEW FUNCTIONS ====================
    
    /**
     * @dev Get swap quote
     */
    function getSwapQuote(
        address inputToken,
        address outputToken,
        uint256 inputAmount
    ) external view returns (uint256 outputAmount, uint256 gasFee) {
        outputAmount = _getExpectedOutput(inputToken, outputToken, inputAmount);
        
        // Apply swap fee
        uint256 feeAmount = (outputAmount * swapFee) / 10000;
        outputAmount -= feeAmount;
        
        // Get gas fee
        GasInfo memory gasInfo = _getGasInfo(outputToken);
        gasFee = gasInfo.gasFee;
        
        return (outputAmount, gasFee);
    }
    
    /**
     * @dev Get gas fee for a token
     */
    function getGasFee(address token) external view returns (address gasToken, uint256 fee) {
        (gasToken, fee) = IZRC20(token).withdrawGasFee();
        fee = fee + (fee * gasFeeBuffer) / 100;
    }
    
    /**
     * @dev Check if chain is Bitcoin
     */
    function isBitcoinChain(uint256 chainId) external pure returns (bool) {
        return chainId == BITCOIN_MAINNET || chainId == BITCOIN_TESTNET;
    }
}

// ==================== INTERFACES ====================

interface IUniswapV2Router02 {
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);
    
    function getAmountsOut(
        uint256 amountIn,
        address[] calldata path
    ) external view returns (uint256[] memory amounts);
} 