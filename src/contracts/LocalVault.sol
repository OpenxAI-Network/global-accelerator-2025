// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title LocalVault - EVM Chain Vault for Aegis Cross-Chain Lending
 * @dev This contract locks liquidity on local EVM chains (Base, Avalanche) and notifies ZetaChain
 * via the Gateway API for cross-chain lending operations.
 */
contract LocalVault is ReentrancyGuard, Ownable {
    using SafeERC20 for IERC20;

    // ============ STRUCTS ============
    
    struct VaultAsset {
        string symbol;
        address tokenAddress;
        uint256 totalDeposited;
        uint256 totalBorrowed;
        uint256 availableLiquidity;
        uint256 apy;
        bool isActive;
    }
    
    struct UserDeposit {
        uint256 amount;
        uint256 timestamp;
        bool isLocked;
        uint256 unlockTime;
    }
    
    struct CrossChainMessage {
        uint256 messageId;
        string targetChain;
        string messageType;
        bytes data;
        uint256 timestamp;
        bool isProcessed;
    }
    
    // ============ STATE VARIABLES ============
    
    string public chainId;                    // "base", "avalanche"
    string public chainName;                  // "Base", "Avalanche"
    address public zetaChainGateway;          // ZetaChain Gateway API address
    address public universalLendingContract;  // ZetaChain Universal Lending contract
    
    // Vault assets
    mapping(string => VaultAsset) public vaultAssets;
    string[] public supportedAssets;
    
    // User deposits
    mapping(address => mapping(string => UserDeposit)) public userDeposits;
    mapping(address => string[]) public userAssetList;
    
    // Cross-chain message tracking
    mapping(uint256 => CrossChainMessage) public crossChainMessages;
    uint256 public messageCounter;
    
    // Risk parameters
    uint256 public minDepositAmount = 100 * 10**18; // 100 USDC equivalent
    uint256 public maxDepositAmount = 1000000 * 10**18; // 1M USDC equivalent
    uint256 public lockPeriod = 7 days; // 7-day lock period
    
    // Events
    event AssetDeposited(
        address indexed user,
        string assetSymbol,
        uint256 amount,
        uint256 lockTime
    );
    
    event AssetWithdrawn(
        address indexed user,
        string assetSymbol,
        uint256 amount
    );
    
    event CrossChainMessageSent(
        uint256 indexed messageId,
        string targetChain,
        string messageType,
        bytes data
    );
    
    event CrossChainMessageReceived(
        uint256 indexed messageId,
        string fromChain,
        string messageType,
        bytes data
    );
    
    event LiquidityBorrowed(
        address indexed borrower,
        string assetSymbol,
        uint256 amount,
        uint256 interestRate
    );
    
    event LiquidityRepaid(
        address indexed borrower,
        string assetSymbol,
        uint256 amount,
        uint256 interestPaid
    );
    
    // ============ CONSTRUCTOR ============
    
    constructor(
        string memory _chainId,
        string memory _chainName,
        address _zetaChainGateway,
        address _universalLendingContract
    ) {
        chainId = _chainId;
        chainName = _chainName;
        zetaChainGateway = _zetaChainGateway;
        universalLendingContract = _universalLendingContract;
        
        // Initialize supported assets based on chain
        _initializeSupportedAssets();
    }
    
    // ============ CORE FUNCTIONS ============
    
    /**
     * @dev Deposit assets into the vault for cross-chain lending
     * @param assetSymbol The asset symbol to deposit
     * @param amount The amount to deposit
     */
    function depositAsset(string memory assetSymbol, uint256 amount) external nonReentrant {
        require(_isAssetSupported(assetSymbol), "Asset not supported");
        require(amount >= minDepositAmount, "Amount below minimum");
        require(amount <= maxDepositAmount, "Amount above maximum");
        
        VaultAsset storage asset = vaultAssets[assetSymbol];
        require(asset.isActive, "Asset not active");
        
        // Transfer tokens from user to vault
        IERC20 token = IERC20(asset.tokenAddress);
        require(token.balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update vault state
        asset.totalDeposited += amount;
        asset.availableLiquidity += amount;
        
        // Update user deposit
        if (userDeposits[msg.sender][assetSymbol].amount == 0) {
            userAssetList[msg.sender].push(assetSymbol);
        }
        
        userDeposits[msg.sender][assetSymbol] = UserDeposit({
            amount: userDeposits[msg.sender][assetSymbol].amount + amount,
            timestamp: block.timestamp,
            isLocked: true,
            unlockTime: block.timestamp + lockPeriod
        });
        
        // Send cross-chain message to ZetaChain
        _sendCrossChainMessage(
            "zeta",
            "DEPOSIT",
            abi.encode(msg.sender, assetSymbol, amount, chainId)
        );
        
        emit AssetDeposited(msg.sender, assetSymbol, amount, block.timestamp + lockPeriod);
    }
    
    /**
     * @dev Withdraw assets from the vault (after lock period)
     * @param assetSymbol The asset symbol to withdraw
     * @param amount The amount to withdraw
     */
    function withdrawAsset(string memory assetSymbol, uint256 amount) external nonReentrant {
        require(_isAssetSupported(assetSymbol), "Asset not supported");
        
        UserDeposit storage deposit = userDeposits[msg.sender][assetSymbol];
        require(deposit.amount >= amount, "Insufficient deposit");
        require(deposit.isLocked, "Deposit not locked");
        require(block.timestamp >= deposit.unlockTime, "Lock period not expired");
        
        VaultAsset storage asset = vaultAssets[assetSymbol];
        require(asset.availableLiquidity >= amount, "Insufficient vault liquidity");
        
        // Update vault state
        asset.totalDeposited -= amount;
        asset.availableLiquidity -= amount;
        
        // Update user deposit
        deposit.amount -= amount;
        if (deposit.amount == 0) {
            deposit.isLocked = false;
            _removeAssetFromUserList(msg.sender, assetSymbol);
        }
        
        // Transfer tokens back to user
        IERC20 token = IERC20(asset.tokenAddress);
        token.safeTransfer(msg.sender, amount);
        
        // Send cross-chain message to ZetaChain
        _sendCrossChainMessage(
            "zeta",
            "WITHDRAW",
            abi.encode(msg.sender, assetSymbol, amount, chainId)
        );
        
        emit AssetWithdrawn(msg.sender, assetSymbol, amount);
    }
    
    /**
     * @dev Borrow liquidity from the vault (called by ZetaChain Universal Contract)
     * @param borrower The address borrowing liquidity
     * @param assetSymbol The asset to borrow
     * @param amount The amount to borrow
     * @param interestRate The interest rate for the loan
     */
    function borrowLiquidity(
        address borrower,
        string memory assetSymbol,
        uint256 amount,
        uint256 interestRate
    ) external onlyZetaChainGateway {
        require(_isAssetSupported(assetSymbol), "Asset not supported");
        
        VaultAsset storage asset = vaultAssets[assetSymbol];
        require(asset.availableLiquidity >= amount, "Insufficient liquidity");
        
        // Update vault state
        asset.totalBorrowed += amount;
        asset.availableLiquidity -= amount;
        
        // Transfer tokens to borrower
        IERC20 token = IERC20(asset.tokenAddress);
        token.safeTransfer(borrower, amount);
        
        emit LiquidityBorrowed(borrower, assetSymbol, amount, interestRate);
    }
    
    /**
     * @dev Repay borrowed liquidity
     * @param assetSymbol The asset being repaid
     * @param amount The amount to repay
     */
    function repayLiquidity(string memory assetSymbol, uint256 amount) external nonReentrant {
        require(_isAssetSupported(assetSymbol), "Asset not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        VaultAsset storage asset = vaultAssets[assetSymbol];
        
        // Transfer tokens from user to vault
        IERC20 token = IERC20(asset.tokenAddress);
        require(token.balanceOf(msg.sender) >= amount, "Insufficient balance");
        require(token.allowance(msg.sender, address(this)) >= amount, "Insufficient allowance");
        
        token.safeTransferFrom(msg.sender, address(this), amount);
        
        // Update vault state
        asset.totalBorrowed = asset.totalBorrowed > amount ? asset.totalBorrowed - amount : 0;
        asset.availableLiquidity += amount;
        
        // Send cross-chain message to ZetaChain
        _sendCrossChainMessage(
            "zeta",
            "REPAY",
            abi.encode(msg.sender, assetSymbol, amount, chainId)
        );
        
        emit LiquidityRepaid(msg.sender, assetSymbol, amount, 0); // Interest calculated off-chain
    }
    
    // ============ CROSS-CHAIN MESSAGING ============
    
    /**
     * @dev Send cross-chain message to ZetaChain
     */
    function _sendCrossChainMessage(
        string memory targetChain,
        string memory messageType,
        bytes memory data
    ) internal {
        messageCounter++;
        
        CrossChainMessage memory message = CrossChainMessage({
            messageId: messageCounter,
            targetChain: targetChain,
            messageType: messageType,
            data: data,
            timestamp: block.timestamp,
            isProcessed: false
        });
        
        crossChainMessages[messageCounter] = message;
        
        emit CrossChainMessageSent(messageCounter, targetChain, messageType, data);
        
        // In production, this would trigger ZetaChain's cross-chain messaging system
        // _triggerZetaChainMessage(targetChain, messageType, data);
    }
    
    /**
     * @dev Receive cross-chain message from ZetaChain (called by Gateway)
     */
    function receiveCrossChainMessage(
        string memory fromChain,
        string memory messageType,
        bytes memory data
    ) external onlyZetaChainGateway {
        messageCounter++;
        
        CrossChainMessage memory message = CrossChainMessage({
            messageId: messageCounter,
            targetChain: chainId,
            messageType: messageType,
            data: data,
            timestamp: block.timestamp,
            isProcessed: true
        });
        
        crossChainMessages[messageCounter] = message;
        
        emit CrossChainMessageReceived(messageCounter, fromChain, messageType, data);
        
        // Process the message based on type
        _processCrossChainMessage(message);
    }
    
    /**
     * @dev Process incoming cross-chain messages
     */
    function _processCrossChainMessage(CrossChainMessage memory message) internal {
        if (keccak256(bytes(message.messageType)) == keccak256(bytes("LOAN_APPROVAL"))) {
            // Process loan approval from ZetaChain
            (address borrower, string memory assetSymbol, uint256 amount, uint256 interestRate) = 
                abi.decode(message.data, (address, string, uint256, uint256));
            
            // Call borrow function
            borrowLiquidity(borrower, assetSymbol, amount, interestRate);
            
        } else if (keccak256(bytes(message.messageType)) == keccak256(bytes("LIQUIDATION"))) {
            // Process liquidation order from ZetaChain
            (address user, string memory assetSymbol, uint256 amount) = 
                abi.decode(message.data, (address, string, uint256));
            
            // Execute liquidation logic
            _executeLiquidation(user, assetSymbol, amount);
        }
    }
    
    /**
     * @dev Execute liquidation of user's collateral
     */
    function _executeLiquidation(
        address user,
        string memory assetSymbol,
        uint256 amount
    ) internal {
        UserDeposit storage deposit = userDeposits[user][assetSymbol];
        require(deposit.amount >= amount, "Insufficient collateral for liquidation");
        
        VaultAsset storage asset = vaultAssets[assetSymbol];
        
        // Update vault state
        asset.totalDeposited -= amount;
        asset.availableLiquidity += amount;
        
        // Update user deposit
        deposit.amount -= amount;
        if (deposit.amount == 0) {
            deposit.isLocked = false;
            _removeAssetFromUserList(user, assetSymbol);
        }
        
        // Transfer liquidated assets to vault (for auction/sale)
        // In production, this would trigger a liquidation auction
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Get user's deposit information
     */
    function getUserDeposit(address user, string memory assetSymbol) external view returns (UserDeposit memory) {
        return userDeposits[user][assetSymbol];
    }
    
    /**
     * @dev Get user's asset list
     */
    function getUserAssets(address user) external view returns (string[] memory) {
        return userAssetList[user];
    }
    
    /**
     * @dev Get vault asset information
     */
    function getVaultAsset(string memory assetSymbol) external view returns (VaultAsset memory) {
        return vaultAssets[assetSymbol];
    }
    
    /**
     * @dev Get supported assets
     */
    function getSupportedAssets() external view returns (string[] memory) {
        return supportedAssets;
    }
    
    /**
     * @dev Get vault statistics
     */
    function getVaultStats() external view returns (
        uint256 totalDeposits,
        uint256 totalBorrows,
        uint256 totalLiquidity,
        uint256 activeUsers
    ) {
        totalDeposits = 0;
        totalBorrows = 0;
        totalLiquidity = 0;
        
        for (uint256 i = 0; i < supportedAssets.length; i++) {
            VaultAsset memory asset = vaultAssets[supportedAssets[i]];
            totalDeposits += asset.totalDeposited;
            totalBorrows += asset.totalBorrowed;
            totalLiquidity += asset.availableLiquidity;
        }
        
        // Count active users (simplified)
        activeUsers = 0; // In production, this would track unique users
        
        return (totalDeposits, totalBorrows, totalLiquidity, activeUsers);
    }
    
    // ============ INTERNAL FUNCTIONS ============
    
    function _initializeSupportedAssets() internal {
        if (keccak256(bytes(chainId)) == keccak256(bytes("base"))) {
            // Base chain assets
            supportedAssets = ["ETH", "USDC", "USDbC"];
            
            vaultAssets["ETH"] = VaultAsset({
                symbol: "ETH",
                tokenAddress: address(0), // Native ETH
                totalDeposited: 0,
                totalBorrowed: 0,
                availableLiquidity: 0,
                apy: 300, // 3% APY
                isActive: true
            });
            
            vaultAssets["USDC"] = VaultAsset({
                symbol: "USDC",
                tokenAddress: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913, // Base USDC
                totalDeposited: 0,
                totalBorrowed: 0,
                availableLiquidity: 0,
                apy: 500, // 5% APY
                isActive: true
            });
            
            vaultAssets["USDbC"] = VaultAsset({
                symbol: "USDbC",
                tokenAddress: 0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA, // Base USDbC
                totalDeposited: 0,
                totalBorrowed: 0,
                availableLiquidity: 0,
                apy: 500, // 5% APY
                isActive: true
            });
            
        } else if (keccak256(bytes(chainId)) == keccak256(bytes("avalanche"))) {
            // Avalanche chain assets
            supportedAssets = ["AVAX", "USDC", "WETH"];
            
            vaultAssets["AVAX"] = VaultAsset({
                symbol: "AVAX",
                tokenAddress: address(0), // Native AVAX
                totalDeposited: 0,
                totalBorrowed: 0,
                availableLiquidity: 0,
                apy: 400, // 4% APY
                isActive: true
            });
            
            vaultAssets["USDC"] = VaultAsset({
                symbol: "USDC",
                tokenAddress: 0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E, // Avalanche USDC
                totalDeposited: 0,
                totalBorrowed: 0,
                availableLiquidity: 0,
                apy: 500, // 5% APY
                isActive: true
            });
            
            vaultAssets["WETH"] = VaultAsset({
                symbol: "WETH",
                tokenAddress: 0x49D5c2BdFfac6CE2BFdB6640F4F80f226bc10bAB, // Avalanche WETH
                totalDeposited: 0,
                totalBorrowed: 0,
                availableLiquidity: 0,
                apy: 300, // 3% APY
                isActive: true
            });
        }
    }
    
    function _isAssetSupported(string memory assetSymbol) internal view returns (bool) {
        for (uint256 i = 0; i < supportedAssets.length; i++) {
            if (keccak256(bytes(supportedAssets[i])) == keccak256(bytes(assetSymbol))) {
                return true;
            }
        }
        return false;
    }
    
    function _removeAssetFromUserList(address user, string memory assetSymbol) internal {
        string[] storage userAssets = userAssetList[user];
        for (uint256 i = 0; i < userAssets.length; i++) {
            if (keccak256(bytes(userAssets[i])) == keccak256(bytes(assetSymbol))) {
                // Remove by replacing with last element and popping
                userAssets[i] = userAssets[userAssets.length - 1];
                userAssets.pop();
                break;
            }
        }
    }
    
    // ============ MODIFIERS ============
    
    modifier onlyZetaChainGateway() {
        require(msg.sender == zetaChainGateway, "Only ZetaChain Gateway can call this");
        _;
    }
    
    // ============ ADMIN FUNCTIONS ============
    
    /**
     * @dev Update ZetaChain Gateway address
     */
    function updateZetaChainGateway(address newGateway) external onlyOwner {
        zetaChainGateway = newGateway;
    }
    
    /**
     * @dev Update Universal Lending contract address
     */
    function updateUniversalLendingContract(address newContract) external onlyOwner {
        universalLendingContract = newContract;
    }
    
    /**
     * @dev Update risk parameters
     */
    function updateRiskParameters(
        uint256 _minDepositAmount,
        uint256 _maxDepositAmount,
        uint256 _lockPeriod
    ) external onlyOwner {
        minDepositAmount = _minDepositAmount;
        maxDepositAmount = _maxDepositAmount;
        lockPeriod = _lockPeriod;
    }
    
    /**
     * @dev Add new supported asset
     */
    function addSupportedAsset(
        string memory symbol,
        address tokenAddress,
        uint256 apy
    ) external onlyOwner {
        require(!_isAssetSupported(symbol), "Asset already supported");
        
        supportedAssets.push(symbol);
        vaultAssets[symbol] = VaultAsset({
            symbol: symbol,
            tokenAddress: tokenAddress,
            totalDeposited: 0,
            totalBorrowed: 0,
            availableLiquidity: 0,
            apy: apy,
            isActive: true
        });
    }
    
    /**
     * @dev Emergency pause vault
     */
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause
        // This would prevent new deposits and withdrawals
    }
    
    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw(string memory assetSymbol, uint256 amount) external onlyOwner {
        require(_isAssetSupported(assetSymbol), "Asset not supported");
        
        VaultAsset storage asset = vaultAssets[assetSymbol];
        require(asset.availableLiquidity >= amount, "Insufficient liquidity");
        
        asset.availableLiquidity -= amount;
        
        if (asset.tokenAddress == address(0)) {
            // Native token (ETH/AVAX)
            payable(owner()).transfer(amount);
        } else {
            // ERC20 token
            IERC20 token = IERC20(asset.tokenAddress);
            token.safeTransfer(owner(), amount);
        }
    }
}
