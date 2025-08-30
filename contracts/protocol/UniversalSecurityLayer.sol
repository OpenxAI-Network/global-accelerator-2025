// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title UniversalSecurityLayer
 * @dev AEGIS Universal Security Layer deployed on ZetaChain
 * 
 * This contract provides cross-chain security monitoring and asset protection
 * by receiving alerts from the AI threat prediction service and executing
 * protective actions across multiple blockchain ecosystems.
 */
contract UniversalSecurityLayer is SystemContract, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;

    // ==================== STRUCTS ====================
    
    struct SecurityRule {
        uint256 ruleId;
        address user;
        uint256 chainId;
        address targetContract;
        bytes4 methodSelector;
        string condition;
        string action;
        bool isActive;
        uint256 createdAt;
        uint256 lastTriggered;
        uint256 triggerCount;
    }
    
    struct ThreatAlert {
        uint256 alertId;
        address user;
        uint256 sourceChainId;
        address tokenAddress;
        uint256 amount;
        string threatType;
        uint256 riskScore;
        uint256 timestamp;
        bool isResolved;
        string resolution;
    }
    
    struct ProtectionAction {
        uint256 actionId;
        uint256 alertId;
        address user;
        uint256 chainId;
        address token;
        uint256 amount;
        string actionType;
        bool executed;
        uint256 executedAt;
        string result;
    }
    
    struct SafeAddress {
        address user;
        address safeWallet;
        uint256 chainId;
        bool isActive;
        uint256 lastUpdated;
    }

    // ==================== STATE VARIABLES ====================
    
    Counters.Counter private _ruleCounter;
    Counters.Counter private _alertCounter;
    Counters.Counter private _actionCounter;
    
    // Trusted entities
    address public trustedAIOracle;
    address public trustedRelayer;
    mapping(address => bool) public authorizedOperators;
    
    // User configurations
    mapping(address => SafeAddress[]) public userSafeAddresses;
    mapping(address => SecurityRule[]) public userSecurityRules;
    mapping(address => mapping(uint256 => bool)) public userChainProtection;
    
    // Threat tracking
    mapping(uint256 => ThreatAlert) public threatAlerts;
    mapping(uint256 => ProtectionAction) public protectionActions;
    mapping(bytes32 => bool) public threatSignatures;
    
    // Supported chains
    uint256[] public supportedChains;
    
    // Protocol parameters
    uint256 public constant MAX_RISK_SCORE = 100;
    uint256 public constant CRITICAL_THRESHOLD = 80;
    uint256 public constant HIGH_THRESHOLD = 60;
    uint256 public constant RESPONSE_TIME_LIMIT = 300; // 5 minutes
    
    // Events
    event SecurityRuleCreated(
        uint256 indexed ruleId,
        address indexed user,
        uint256 chainId,
        string condition,
        string action
    );
    
    event ThreatDetected(
        uint256 indexed alertId,
        address indexed user,
        uint256 chainId,
        string threatType,
        uint256 riskScore
    );
    
    event ProtectionExecuted(
        uint256 indexed actionId,
        uint256 indexed alertId,
        address indexed user,
        string actionType,
        bool success
    );
    
    event SafeAddressSet(
        address indexed user,
        address indexed safeWallet,
        uint256 chainId
    );
    
    event ChainProtectionToggled(
        address indexed user,
        uint256 chainId,
        bool enabled
    );

    // ==================== MODIFIERS ====================
    
    modifier onlyTrustedAI() {
        require(msg.sender == trustedAIOracle, "Only trusted AI oracle");
        _;
    }
    
    modifier onlyTrustedRelayer() {
        require(msg.sender == trustedRelayer, "Only trusted relayer");
        _;
    }
    
    modifier onlyAuthorized() {
        require(
            msg.sender == trustedAIOracle ||
            msg.sender == trustedRelayer ||
            authorizedOperators[msg.sender] ||
            msg.sender == owner(),
            "Not authorized"
        );
        _;
    }

    // ==================== CONSTRUCTOR ====================
    
    constructor(address _trustedAIOracle, address _trustedRelayer) {
        trustedAIOracle = _trustedAIOracle;
        trustedRelayer = _trustedRelayer;
        
        // Initialize supported chains
        supportedChains = [
            1,    // Ethereum
            137,  // Polygon
            56,   // BSC
            42161, // Arbitrum
            10,   // Optimism
            7001, // ZetaChain Testnet
            7000  // ZetaChain Mainnet
        ];
        
        // Grant initial permissions
        authorizedOperators[msg.sender] = true;
    }

    // ==================== ADMIN FUNCTIONS ====================
    
    function setTrustedAIOracle(address _newOracle) external onlyOwner {
        require(_newOracle != address(0), "Invalid oracle address");
        trustedAIOracle = _newOracle;
    }
    
    function setTrustedRelayer(address _newRelayer) external onlyOwner {
        require(_newRelayer != address(0), "Invalid relayer address");
        trustedRelayer = _newRelayer;
    }
    
    function addAuthorizedOperator(address _operator) external onlyOwner {
        require(_operator != address(0), "Invalid operator address");
        authorizedOperators[_operator] = true;
    }
    
    function removeAuthorizedOperator(address _operator) external onlyOwner {
        authorizedOperators[_operator] = false;
    }
    
    function addSupportedChain(uint256 _chainId) external onlyOwner {
        require(!_isSupportedChain(_chainId), "Chain already supported");
        supportedChains.push(_chainId);
    }
    
    function removeSupportedChain(uint256 _chainId) external onlyOwner {
        for (uint i = 0; i < supportedChains.length; i++) {
            if (supportedChains[i] == _chainId) {
                supportedChains[i] = supportedChains[supportedChains.length - 1];
                supportedChains.pop();
                break;
            }
        }
    }
    
    function pause() external onlyOwner {
        _pause();
    }
    
    function unpause() external onlyOwner {
        _unpause();
    }

    // ==================== USER FUNCTIONS ====================
    
    /**
     * @dev Set a safe address for asset protection on a specific chain
     */
    function setSafeAddress(
        address _safeWallet,
        uint256 _chainId
    ) external {
        require(_safeWallet != address(0), "Invalid safe address");
        require(_isSupportedChain(_chainId), "Unsupported chain");
        
        // Remove existing safe address for this chain
        SafeAddress[] storage addresses = userSafeAddresses[msg.sender];
        for (uint i = 0; i < addresses.length; i++) {
            if (addresses[i].chainId == _chainId) {
                addresses[i].isActive = false;
                addresses[i].lastUpdated = block.timestamp;
            }
        }
        
        // Add new safe address
        addresses.push(SafeAddress({
            user: msg.sender,
            safeWallet: _safeWallet,
            chainId: _chainId,
            isActive: true,
            lastUpdated: block.timestamp
        }));
        
        emit SafeAddressSet(msg.sender, _safeWallet, _chainId);
    }
    
    /**
     * @dev Enable/disable protection for a specific chain
     */
    function toggleChainProtection(uint256 _chainId, bool _enabled) external {
        require(_isSupportedChain(_chainId), "Unsupported chain");
        userChainProtection[msg.sender][_chainId] = _enabled;
        emit ChainProtectionToggled(msg.sender, _chainId, _enabled);
    }
    
    /**
     * @dev Create a custom security rule
     */
    function createSecurityRule(
        uint256 _chainId,
        address _targetContract,
        bytes4 _methodSelector,
        string memory _condition,
        string memory _action
    ) external {
        require(_isSupportedChain(_chainId), "Unsupported chain");
        require(_targetContract != address(0), "Invalid target contract");
        
        _ruleCounter.increment();
        uint256 ruleId = _ruleCounter.current();
        
        userSecurityRules[msg.sender].push(SecurityRule({
            ruleId: ruleId,
            user: msg.sender,
            chainId: _chainId,
            targetContract: _targetContract,
            methodSelector: _methodSelector,
            condition: _condition,
            action: _action,
            isActive: true,
            createdAt: block.timestamp,
            lastTriggered: 0,
            triggerCount: 0
        }));
        
        emit SecurityRuleCreated(ruleId, msg.sender, _chainId, _condition, _action);
    }

    // ==================== AI ORACLE FUNCTIONS ====================
    
    /**
     * @dev Called by AI oracle when a threat is detected
     */
    function reportThreat(
        address _user,
        uint256 _sourceChainId,
        address _tokenAddress,
        uint256 _amount,
        string memory _threatType,
        uint256 _riskScore
    ) external onlyTrustedAI returns (uint256) {
        require(_user != address(0), "Invalid user address");
        require(_isSupportedChain(_sourceChainId), "Unsupported source chain");
        require(_riskScore <= MAX_RISK_SCORE, "Invalid risk score");
        
        _alertCounter.increment();
        uint256 alertId = _alertCounter.current();
        
        threatAlerts[alertId] = ThreatAlert({
            alertId: alertId,
            user: _user,
            sourceChainId: _sourceChainId,
            tokenAddress: _tokenAddress,
            amount: _amount,
            threatType: _threatType,
            riskScore: _riskScore,
            timestamp: block.timestamp,
            isResolved: false,
            resolution: ""
        });
        
        emit ThreatDetected(alertId, _user, _sourceChainId, _threatType, _riskScore);
        
        // Auto-trigger protection for critical threats
        if (_riskScore >= CRITICAL_THRESHOLD) {
            _autoTriggerProtection(alertId);
        }
        
        return alertId;
    }

    // ==================== RELAYER FUNCTIONS ====================
    
    /**
     * @dev Execute protection action via trusted relayer
     */
    function executeProtection(
        uint256 _alertId,
        string memory _actionType
    ) external onlyTrustedRelayer returns (bool) {
        require(_alertId > 0 && _alertId <= _alertCounter.current(), "Invalid alert ID");
        
        ThreatAlert storage alert = threatAlerts[_alertId];
        require(!alert.isResolved, "Alert already resolved");
        
        // Check if user has protection enabled for this chain
        require(
            userChainProtection[alert.user][alert.sourceChainId],
            "Chain protection not enabled"
        );
        
        // Create protection action
        _actionCounter.increment();
        uint256 actionId = _actionCounter.current();
        
        protectionActions[actionId] = ProtectionAction({
            actionId: actionId,
            alertId: _alertId,
            user: alert.user,
            chainId: alert.sourceChainId,
            token: alert.tokenAddress,
            amount: alert.amount,
            actionType: _actionType,
            executed: false,
            executedAt: 0,
            result: ""
        });
        
        // Execute the protection
        bool success = _executeProtectionAction(actionId);
        
        // Update action status
        protectionActions[actionId].executed = true;
        protectionActions[actionId].executedAt = block.timestamp;
        protectionActions[actionId].result = success ? "SUCCESS" : "FAILED";
        
        // Mark alert as resolved
        alert.isResolved = true;
        alert.resolution = _actionType;
        
        emit ProtectionExecuted(actionId, _alertId, alert.user, _actionType, success);
        
        return success;
    }

    // ==================== INTERNAL FUNCTIONS ====================
    
    function _autoTriggerProtection(uint256 _alertId) internal {
        ThreatAlert storage alert = threatAlerts[_alertId];
        
        // Only auto-trigger if user has protection enabled
        if (!userChainProtection[alert.user][alert.sourceChainId]) {
            return;
        }
        
        // Create and execute protection action
        _actionCounter.increment();
        uint256 actionId = _actionCounter.current();
        
        protectionActions[actionId] = ProtectionAction({
            actionId: actionId,
            alertId: _alertId,
            user: alert.user,
            chainId: alert.sourceChainId,
            token: alert.tokenAddress,
            amount: alert.amount,
            actionType: "AUTO_FREEZE",
            executed: false,
            executedAt: 0,
            result: ""
        });
        
        bool success = _executeProtectionAction(actionId);
        
        // Update status
        protectionActions[actionId].executed = true;
        protectionActions[actionId].executedAt = block.timestamp;
        protectionActions[actionId].result = success ? "SUCCESS" : "FAILED";
        
        emit ProtectionExecuted(actionId, _alertId, alert.user, "AUTO_FREEZE", success);
    }
    
    function _executeProtectionAction(uint256 _actionId) internal returns (bool) {
        ProtectionAction storage action = protectionActions[_actionId];
        
        try {
            if (keccak256(bytes(action.actionType)) == keccak256(bytes("FREEZE_ASSETS"))) {
                return _freezeUserAssets(action.user, action.chainId);
            } else if (keccak256(bytes(action.actionType)) == keccak256(bytes("MOVE_TO_SAFE"))) {
                return _moveAssetsToSafe(action.user, action.chainId, action.token, action.amount);
            } else if (keccak256(bytes(action.actionType)) == keccak256(bytes("AUTO_FREEZE"))) {
                return _freezeUserAssets(action.user, action.chainId);
            }
            
            return false;
        } catch {
            return false;
        }
    }
    
    function _freezeUserAssets(address _user, uint256 _chainId) internal returns (bool) {
        // Implementation would freeze user's assets on the specified chain
        // This is a placeholder for the actual cross-chain freeze mechanism
        return true;
    }
    
    function _moveAssetsToSafe(
        address _user,
        uint256 _chainId,
        address _token,
        uint256 _amount
    ) internal returns (bool) {
        // Find user's safe address for this chain
        SafeAddress[] storage addresses = userSafeAddresses[_user];
        address safeAddress = address(0);
        
        for (uint i = 0; i < addresses.length; i++) {
            if (addresses[i].chainId == _chainId && addresses[i].isActive) {
                safeAddress = addresses[i].safeWallet;
                break;
            }
        }
        
        if (safeAddress == address(0)) {
            return false;
        }
        
        // Implementation would move assets to safe address
        // This is a placeholder for the actual cross-chain transfer mechanism
        return true;
    }
    
    function _isSupportedChain(uint256 _chainId) internal view returns (bool) {
        for (uint i = 0; i < supportedChains.length; i++) {
            if (supportedChains[i] == _chainId) {
                return true;
            }
        }
        return false;
    }

    // ==================== VIEW FUNCTIONS ====================
    
    function getSupportedChains() external view returns (uint256[] memory) {
        return supportedChains;
    }
    
    function getUserSafeAddresses(address _user) external view returns (SafeAddress[] memory) {
        return userSafeAddresses[_user];
    }
    
    function getUserSecurityRules(address _user) external view returns (SecurityRule[] memory) {
        return userSecurityRules[_user];
    }
    
    function getThreatAlert(uint256 _alertId) external view returns (ThreatAlert memory) {
        return threatAlerts[_alertId];
    }
    
    function getProtectionAction(uint256 _actionId) external view returns (ProtectionAction memory) {
        return protectionActions[_actionId];
    }
    
    function isChainProtected(address _user, uint256 _chainId) external view returns (bool) {
        return userChainProtection[_user][_chainId];
    }
    
    function getTotalAlerts() external view returns (uint256) {
        return _alertCounter.current();
    }
    
    function getTotalActions() external view returns (uint256) {
        return _actionCounter.current();
    }
    
    function getTotalRules() external view returns (uint256) {
        return _ruleCounter.current();
    }
}
