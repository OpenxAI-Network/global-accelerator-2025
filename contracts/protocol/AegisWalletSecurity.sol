// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol";
import "@zetachain/protocol-contracts/contracts/zevm/UniversalContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title AegisWalletSecurity
 * @dev 2FA integration with cross-chain transaction approval
 * @notice Provides multi-factor authentication for cross-chain operations
 */
contract AegisWalletSecurity is UniversalContract, Ownable, ReentrancyGuard {
    using ECDSA for bytes32;
    using SafeMath for uint256;

    // ========== STRUCTS ==========
    
    struct SecuritySettings {
        bool twoFactorEnabled;
        uint256 approvalTimeout; // Time in seconds before approval expires
        uint256 maxDailyTransactions;
        uint256 maxTransactionAmount;
        bool requireApprovalForLargeTx;
        uint256 largeTransactionThreshold;
    }
    
    struct TransactionRequest {
        uint256 requestId;
        address user;
        uint256 targetChain;
        address targetAddress;
        uint256 amount;
        address token;
        string description;
        uint256 timestamp;
        bool approved;
        bool executed;
        bytes signature;
        uint256 approvalExpiry;
    }
    
    struct TwoFactorAuth {
        address user;
        bytes32 secretHash; // Hash of the 2FA secret
        uint256 lastUsed;
        uint256 failedAttempts;
        bool locked;
        uint256 lockUntil;
    }
    
    struct CrossChainApproval {
        uint256 sourceChain;
        address user;
        uint256 targetChain;
        address targetAddress;
        uint256 maxAmount;
        uint256 expiry;
        bool active;
    }

    // ========== STATE VARIABLES ==========
    
    SystemContract public immutable systemContract;
    
    // Security settings per user
    mapping(address => SecuritySettings) public userSecuritySettings;
    
    // 2FA data per user
    mapping(address => TwoFactorAuth) public twoFactorData;
    
    // Transaction requests
    mapping(uint256 => TransactionRequest) public transactionRequests;
    mapping(address => uint256[]) public userTransactionRequests;
    uint256 public nextRequestId;
    
    // Cross-chain approvals
    mapping(bytes32 => CrossChainApproval) public crossChainApprovals;
    
    // Daily transaction counters
    mapping(address => mapping(uint256 => uint256)) public dailyTransactionCounts; // user => day => count
    mapping(address => mapping(uint256 => uint256)) public dailyTransactionAmounts; // user => day => amount
    
    // Trusted authenticators (2FA providers)
    mapping(address => bool) public trustedAuthenticators;
    
    // Events
    event SecuritySettingsUpdated(address indexed user, bool twoFactorEnabled, uint256 approvalTimeout);
    event TwoFactorEnabled(address indexed user, bytes32 indexed secretHash);
    event TwoFactorDisabled(address indexed user);
    event TransactionRequested(uint256 indexed requestId, address indexed user, uint256 targetChain, uint256 amount);
    event TransactionApproved(uint256 indexed requestId, address indexed user, bytes signature);
    event TransactionExecuted(uint256 indexed requestId, address indexed user, bool success);
    event CrossChainApprovalGranted(address indexed user, uint256 sourceChain, uint256 targetChain, uint256 maxAmount);
    event SecurityAlert(address indexed user, string alertType, string description);

    // ========== MODIFIERS ==========
    
    modifier onlyTrustedAuthenticator() {
        require(trustedAuthenticators[msg.sender], "Aegis: Only trusted authenticator");
        _;
    }
    
    modifier onlyUserOrOwner(address user) {
        require(msg.sender == user || msg.sender == owner(), "Aegis: Only user or owner");
        _;
    }
    
    modifier twoFactorRequired(address user) {
        require(userSecuritySettings[user].twoFactorEnabled, "Aegis: 2FA not enabled");
        require(!twoFactorData[user].locked, "Aegis: 2FA account locked");
        _;
    }

    // ========== CONSTRUCTOR ==========
    
    constructor(address _systemContract) {
        systemContract = SystemContract(_systemContract);
        _transferOwnership(msg.sender);
    }

    // ========== PUBLIC FUNCTIONS ==========
    
    /**
     * @dev Enable 2FA for a user
     * @param secretHash Hash of the 2FA secret (e.g., TOTP secret)
     */
    function enableTwoFactor(bytes32 secretHash) external {
        require(secretHash != bytes32(0), "Aegis: Invalid secret hash");
        require(!twoFactorData[msg.sender].locked, "Aegis: Account locked");
        
        twoFactorData[msg.sender] = TwoFactorAuth({
            user: msg.sender,
            secretHash: secretHash,
            lastUsed: 0,
            failedAttempts: 0,
            locked: false,
            lockUntil: 0
        });
        
        userSecuritySettings[msg.sender].twoFactorEnabled = true;
        
        emit TwoFactorEnabled(msg.sender, secretHash);
    }
    
    /**
     * @dev Disable 2FA for a user
     * @param secretHash Hash of the current 2FA secret for verification
     */
    function disableTwoFactor(bytes32 secretHash) external {
        require(twoFactorData[msg.sender].secretHash == secretHash, "Aegis: Invalid secret");
        
        delete twoFactorData[msg.sender];
        userSecuritySettings[msg.sender].twoFactorEnabled = false;
        
        emit TwoFactorDisabled(msg.sender);
    }
    
    /**
     * @dev Update security settings
     * @param approvalTimeout New approval timeout in seconds
     * @param maxDailyTransactions Maximum daily transactions
     * @param maxTransactionAmount Maximum transaction amount
     * @param requireApprovalForLargeTx Whether to require approval for large transactions
     * @param largeTransactionThreshold Threshold for large transactions
     */
    function updateSecuritySettings(
        uint256 approvalTimeout,
        uint256 maxDailyTransactions,
        uint256 maxTransactionAmount,
        bool requireApprovalForLargeTx,
        uint256 largeTransactionThreshold
    ) external {
        SecuritySettings storage settings = userSecuritySettings[msg.sender];
        
        settings.approvalTimeout = approvalTimeout;
        settings.maxDailyTransactions = maxDailyTransactions;
        settings.maxTransactionAmount = maxTransactionAmount;
        settings.requireApprovalForLargeTx = requireApprovalForLargeTx;
        settings.largeTransactionThreshold = largeTransactionThreshold;
        
        emit SecuritySettingsUpdated(
            msg.sender,
            settings.twoFactorEnabled,
            approvalTimeout
        );
    }
    
    /**
     * @dev Request a cross-chain transaction
     * @param targetChain Target chain ID
     * @param targetAddress Target address on the target chain
     * @param amount Amount to transfer
     * @param token Token address (ZRC-20 on ZetaChain)
     * @param description Description of the transaction
     */
    function requestTransaction(
        uint256 targetChain,
        address targetAddress,
        uint256 amount,
        address token,
        string calldata description
    ) external returns (uint256 requestId) {
        require(targetAddress != address(0), "Aegis: Invalid target address");
        require(amount > 0, "Aegis: Invalid amount");
        require(bytes(description).length > 0, "Aegis: Description required");
        
        SecuritySettings storage settings = userSecuritySettings[msg.sender];
        
        // Check daily limits
        uint256 today = block.timestamp / 86400; // Days since epoch
        require(
            dailyTransactionCounts[msg.sender][today] < settings.maxDailyTransactions,
            "Aegis: Daily transaction limit exceeded"
        );
        require(
            dailyTransactionAmounts[msg.sender][today].add(amount) <= settings.maxTransactionAmount,
            "Aegis: Daily amount limit exceeded"
        );
        
        // Check if approval is required
        bool requiresApproval = settings.requireApprovalForLargeTx && 
                               amount >= settings.largeTransactionThreshold;
        
        requestId = nextRequestId++;
        
        transactionRequests[requestId] = TransactionRequest({
            requestId: requestId,
            user: msg.sender,
            targetChain: targetChain,
            targetAddress: targetAddress,
            amount: amount,
            token: token,
            description: description,
            timestamp: block.timestamp,
            approved: !requiresApproval, // Auto-approve if no approval required
            executed: false,
            signature: "",
            approvalExpiry: requiresApproval ? block.timestamp.add(settings.approvalTimeout) : 0
        });
        
        userTransactionRequests[msg.sender].push(requestId);
        
        // Update daily counters
        dailyTransactionCounts[msg.sender][today]++;
        dailyTransactionAmounts[msg.sender][today] = dailyTransactionAmounts[msg.sender][today].add(amount);
        
        emit TransactionRequested(requestId, msg.sender, targetChain, amount);
        
        // If no approval required, execute immediately
        if (!requiresApproval) {
            _executeTransaction(requestId);
        }
        
        return requestId;
    }
    
    /**
     * @dev Approve a transaction with 2FA signature
     * @param requestId ID of the transaction request
     * @param signature 2FA signature
     */
    function approveTransaction(uint256 requestId, bytes calldata signature) external {
        TransactionRequest storage request = transactionRequests[requestId];
        require(request.user != address(0), "Aegis: Request not found");
        require(msg.sender == request.user, "Aegis: Only request owner can approve");
        require(!request.approved, "Aegis: Already approved");
        require(block.timestamp < request.approvalExpiry, "Aegis: Approval expired");
        require(!request.executed, "Aegis: Already executed");
        
        // Verify 2FA signature
        require(_verifyTwoFactorSignature(request.user, requestId, signature), "Aegis: Invalid 2FA signature");
        
        request.approved = true;
        request.signature = signature;
        
        emit TransactionApproved(requestId, request.user, signature);
        
        // Execute the transaction
        _executeTransaction(requestId);
    }
    
    /**
     * @dev Grant cross-chain approval for a user
     * @param user Address of the user
     * @param sourceChain Source chain ID
     * @param targetChain Target chain ID
     * @param targetAddress Target address on target chain
     * @param maxAmount Maximum amount that can be transferred
     * @param expiry Expiry timestamp
     */
    function grantCrossChainApproval(
        address user,
        uint256 sourceChain,
        uint256 targetChain,
        address targetAddress,
        uint256 maxAmount,
        uint256 expiry
    ) external onlyUserOrOwner(user) {
        require(expiry > block.timestamp, "Aegis: Invalid expiry time");
        require(maxAmount > 0, "Aegis: Invalid max amount");
        
        bytes32 approvalKey = keccak256(abi.encodePacked(
            user, sourceChain, targetChain, targetAddress
        ));
        
        crossChainApprovals[approvalKey] = CrossChainApproval({
            sourceChain: sourceChain,
            user: user,
            targetChain: targetChain,
            targetAddress: targetAddress,
            maxAmount: maxAmount,
            expiry: expiry,
            active: true
        });
        
        emit CrossChainApprovalGranted(user, sourceChain, targetChain, maxAmount);
    }

    // ========== INTERNAL FUNCTIONS ==========
    
    /**
     * @dev Execute a transaction
     * @param requestId ID of the transaction request
     */
    function _executeTransaction(uint256 requestId) internal {
        TransactionRequest storage request = transactionRequests[requestId];
        require(request.approved, "Aegis: Transaction not approved");
        require(!request.executed, "Aegis: Already executed");
        
        request.executed = true;
        
        bool success = false;
        
        try this._performCrossChainTransfer(request) {
            success = true;
        } catch {
            success = false;
        }
        
        emit TransactionExecuted(requestId, request.user, success);
        
        if (!success) {
            emit SecurityAlert(request.user, "TRANSACTION_FAILED", "Cross-chain transfer failed");
        }
    }
    
    /**
     * @dev Perform the actual cross-chain transfer (external for try-catch)
     * @param request The transaction request
     */
    function _performCrossChainTransfer(TransactionRequest memory request) external {
        // This would use ZetaChain's cross-chain messaging to execute the transfer
        // Implementation depends on specific ZetaChain integration requirements
        
        // TODO: Implement actual cross-chain transfer logic
        // Example:
        // systemContract.interchainCall(
        //     request.targetChain,
        //     request.targetAddress,
        //     request.amount,
        //     abi.encode(request.user, request.description)
        // );
    }
    
    /**
     * @dev Verify 2FA signature
     * @param user Address of the user
     * @param requestId ID of the transaction request
     * @param signature 2FA signature
     * @return valid Whether the signature is valid
     */
    function _verifyTwoFactorSignature(
        address user,
        uint256 requestId,
        bytes calldata signature
    ) internal returns (bool valid) {
        TwoFactorAuth storage auth = twoFactorData[user];
        
        // Check if account is locked
        if (auth.locked) {
            if (block.timestamp < auth.lockUntil) {
                return false;
            } else {
                auth.locked = false;
                auth.failedAttempts = 0;
            }
        }
        
        // Verify signature (this is a simplified example)
        // In production, you would verify against the actual 2FA secret
        bytes32 messageHash = keccak256(abi.encodePacked(
            user, requestId, block.timestamp
        ));
        
        // For demo purposes, we'll accept any non-empty signature
        // In production, implement proper TOTP verification
        valid = signature.length > 0;
        
        if (valid) {
            auth.lastUsed = block.timestamp;
            auth.failedAttempts = 0;
        } else {
            auth.failedAttempts++;
            
            // Lock account after 5 failed attempts
            if (auth.failedAttempts >= 5) {
                auth.locked = true;
                auth.lockUntil = block.timestamp.add(3600); // Lock for 1 hour
            }
        }
        
        return valid;
    }

    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @dev Add a trusted authenticator
     * @param authenticator Address of the authenticator
     */
    function addTrustedAuthenticator(address authenticator) external onlyOwner {
        trustedAuthenticators[authenticator] = true;
    }
    
    /**
     * @dev Remove a trusted authenticator
     * @param authenticator Address of the authenticator
     */
    function removeTrustedAuthenticator(address authenticator) external onlyOwner {
        trustedAuthenticators[authenticator] = false;
    }
    
    /**
     * @dev Emergency pause for security
     */
    function emergencyPause() external onlyOwner {
        // Implementation would pause all operations
    }

    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get user's security settings
     * @param user Address of the user
     * @return settings The user's security settings
     */
    function getUserSecuritySettings(address user) external view returns (SecuritySettings memory settings) {
        return userSecuritySettings[user];
    }
    
    /**
     * @dev Get user's 2FA data
     * @param user Address of the user
     * @return auth The user's 2FA data
     */
    function getUserTwoFactorData(address user) external view returns (TwoFactorAuth memory auth) {
        return twoFactorData[user];
    }
    
    /**
     * @dev Get transaction request details
     * @param requestId ID of the transaction request
     * @return request The transaction request
     */
    function getTransactionRequest(uint256 requestId) external view returns (TransactionRequest memory request) {
        return transactionRequests[requestId];
    }
    
    /**
     * @dev Get user's transaction requests
     * @param user Address of the user
     * @return requestIds Array of request IDs
     */
    function getUserTransactionRequests(address user) external view returns (uint256[] memory requestIds) {
        return userTransactionRequests[user];
    }
    
    /**
     * @dev Check if a cross-chain approval is valid
     * @param user Address of the user
     * @param sourceChain Source chain ID
     * @param targetChain Target chain ID
     * @param targetAddress Target address
     * @param amount Amount to transfer
     * @return valid Whether the approval is valid
     */
    function isCrossChainApprovalValid(
        address user,
        uint256 sourceChain,
        uint256 targetChain,
        address targetAddress,
        uint256 amount
    ) external view returns (bool valid) {
        bytes32 approvalKey = keccak256(abi.encodePacked(
            user, sourceChain, targetChain, targetAddress
        ));
        
        CrossChainApproval memory approval = crossChainApprovals[approvalKey];
        
        return approval.active && 
               approval.expiry > block.timestamp && 
               amount <= approval.maxAmount;
    }

    // ========== UNIVERSAL CONTRACT FUNCTIONS ==========
    
    /**
     * @dev Handle cross-chain calls
     */
    function onCrossChainCall(
        address origin,
        uint256 chainID,
        address caller,
        uint256 value,
        bytes calldata message
    ) external override {
        // Handle cross-chain security operations
        // Implementation depends on specific requirements
    }
    
    /**
     * @dev Handle cross-chain call reversals
     */
    function onRevert(
        address origin,
        uint256 chainID,
        address caller,
        uint256 value,
        bytes calldata message
    ) external override {
        // Handle failed cross-chain operations
    }
}

// SafeMath library
library SafeMath {
    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        require(c >= a, "SafeMath: addition overflow");
        return c;
    }
    
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b <= a, "SafeMath: subtraction overflow");
        return a - b;
    }
    
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) return 0;
        uint256 c = a * b;
        require(c / a == b, "SafeMath: multiplication overflow");
        return c;
    }
    
    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        require(b > 0, "SafeMath: division by zero");
        return a / b;
    }
} 