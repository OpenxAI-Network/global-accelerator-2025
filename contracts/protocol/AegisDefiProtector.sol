// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol";
import "@zetachain/protocol-contracts/contracts/zevm/UniversalContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AegisDefiProtector
 * @dev DeFi protection system for lending protocols (Avalon Labs-style)
 * @notice Monitors positions and triggers protection mechanisms
 */
contract AegisDefiProtector is UniversalContract, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // ========== STRUCTS ==========
    
    struct LendingPosition {
        uint256 chainId;
        address lendingPool;
        address user;
        uint256 collateralValue;
        uint256 borrowedValue;
        uint256 healthFactor;
        uint256 lastUpdated;
        bool atRisk;
        bool protected;
    }
    
    struct ProtectionAction {
        uint256 positionId;
        string actionType; // "REPAY", "WITHDRAW_COLLATERAL", "LIQUIDATE", "NOTIFY"
        uint256 amount;
        uint256 priority; // 1-5, where 1 is highest
        bool executed;
        uint256 executedAt;
    }
    
    struct RiskThresholds {
        uint256 criticalHealthFactor; // e.g., 1.1 (110%)
        uint256 highRiskHealthFactor; // e.g., 1.3 (130%)
        uint256 mediumRiskHealthFactor; // e.g., 1.5 (150%)
        uint256 protectionDelay; // Time before protection triggers
        uint256 maxProtectionAmount; // Maximum amount to protect per position
    }

    // ========== STATE VARIABLES ==========
    
    SystemContract public immutable systemContract;
    
    // Risk management
    RiskThresholds public riskThresholds;
    
    // Position tracking
    mapping(uint256 => LendingPosition) public positions;
    mapping(address => uint256[]) public userPositions;
    uint256 public nextPositionId;
    
    // Protection actions
    mapping(uint256 => ProtectionAction) public protectionActions;
    uint256 public nextActionId;
    
    // Supported lending protocols
    mapping(address => bool) public supportedLendingPools;
    mapping(uint256 => address[]) public chainLendingPools;
    
    // AI Oracle for risk assessment
    address public aiOracle;
    
    // Events
    event PositionRegistered(uint256 indexed positionId, address indexed user, uint256 chainId, address lendingPool);
    event RiskDetected(uint256 indexed positionId, uint256 healthFactor, string riskLevel);
    event ProtectionTriggered(uint256 indexed positionId, uint256 indexed actionId, string actionType);
    event ProtectionExecuted(uint256 indexed actionId, bool success, string result);
    event RiskThresholdsUpdated(uint256 critical, uint256 high, uint256 medium);

    // ========== MODIFIERS ==========
    
    modifier onlyAIOracle() {
        require(msg.sender == aiOracle, "Aegis: Only AI Oracle");
        _;
    }
    
    modifier onlySupportedPool(address lendingPool) {
        require(supportedLendingPools[lendingPool], "Aegis: Unsupported lending pool");
        _;
    }

    // ========== CONSTRUCTOR ==========
    
    constructor(address _systemContract) {
        systemContract = SystemContract(_systemContract);
        _transferOwnership(msg.sender);
        
        // Set default risk thresholds
        riskThresholds = RiskThresholds({
            criticalHealthFactor: 110, // 1.1
            highRiskHealthFactor: 130, // 1.3
            mediumRiskHealthFactor: 150, // 1.5
            protectionDelay: 300, // 5 minutes
            maxProtectionAmount: 1000000e18 // $1M
        });
    }

    // ========== PUBLIC FUNCTIONS ==========
    
    /**
     * @dev Register a new lending position for monitoring
     * @param chainId Chain where the position exists
     * @param lendingPool Address of the lending pool
     * @param user Address of the position owner
     * @param collateralValue Value of collateral in USD (with 18 decimals)
     * @param borrowedValue Value of borrowed assets in USD (with 18 decimals)
     */
    function registerPosition(
        uint256 chainId,
        address lendingPool,
        address user,
        uint256 collateralValue,
        uint256 borrowedValue
    ) external onlySupportedPool(lendingPool) {
        require(user != address(0), "Aegis: Invalid user address");
        require(collateralValue > 0, "Aegis: Invalid collateral value");
        
        uint256 positionId = nextPositionId++;
        
        uint256 healthFactor = _calculateHealthFactor(collateralValue, borrowedValue);
        
        positions[positionId] = LendingPosition({
            chainId: chainId,
            lendingPool: lendingPool,
            user: user,
            collateralValue: collateralValue,
            borrowedValue: borrowedValue,
            healthFactor: healthFactor,
            lastUpdated: block.timestamp,
            atRisk: _isAtRisk(healthFactor),
            protected: false
        });
        
        userPositions[user].push(positionId);
        
        emit PositionRegistered(positionId, user, chainId, lendingPool);
        
        // Check if immediate protection is needed
        if (_isAtRisk(healthFactor)) {
            _triggerProtection(positionId, healthFactor);
        }
    }
    
    /**
     * @dev Update position data (called by oracles or monitoring systems)
     * @param positionId ID of the position to update
     * @param collateralValue New collateral value
     * @param borrowedValue New borrowed value
     */
    function updatePosition(
        uint256 positionId,
        uint256 collateralValue,
        uint256 borrowedValue
    ) external {
        require(positions[positionId].user != address(0), "Aegis: Position not found");
        
        LendingPosition storage position = positions[positionId];
        position.collateralValue = collateralValue;
        position.borrowedValue = borrowedValue;
        position.healthFactor = _calculateHealthFactor(collateralValue, borrowedValue);
        position.lastUpdated = block.timestamp;
        
        bool wasAtRisk = position.atRisk;
        position.atRisk = _isAtRisk(position.healthFactor);
        
        // If position just became at risk, trigger protection
        if (!wasAtRisk && position.atRisk) {
            _triggerProtection(positionId, position.healthFactor);
        }
    }
    
    /**
     * @dev AI Oracle can trigger protection actions
     * @param positionId ID of the position to protect
     * @param actionType Type of protection action
     * @param amount Amount to act on
     * @param priority Priority level (1-5)
     */
    function triggerProtectionAction(
        uint256 positionId,
        string calldata actionType,
        uint256 amount,
        uint256 priority
    ) external onlyAIOracle {
        require(positions[positionId].user != address(0), "Aegis: Position not found");
        require(priority >= 1 && priority <= 5, "Aegis: Invalid priority level");
        
        uint256 actionId = nextActionId++;
        
        protectionActions[actionId] = ProtectionAction({
            positionId: positionId,
            actionType: actionType,
            amount: amount,
            priority: priority,
            executed: false,
            executedAt: 0
        });
        
        emit ProtectionTriggered(positionId, actionId, actionType);
        
        // Execute protection immediately for high priority actions
        if (priority <= 2) {
            _executeProtection(actionId);
        }
    }
    
    /**
     * @dev Execute a protection action
     * @param actionId ID of the action to execute
     */
    function executeProtection(uint256 actionId) external {
        require(protectionActions[actionId].positionId != 0, "Aegis: Action not found");
        require(!protectionActions[actionId].executed, "Aegis: Action already executed");
        
        _executeProtection(actionId);
    }

    // ========== INTERNAL FUNCTIONS ==========
    
    /**
     * @dev Calculate health factor for a position
     * @param collateralValue Value of collateral
     * @param borrowedValue Value of borrowed assets
     * @return healthFactor Health factor (100 = 1.0, 150 = 1.5, etc.)
     */
    function _calculateHealthFactor(uint256 collateralValue, uint256 borrowedValue) internal pure returns (uint256) {
        if (borrowedValue == 0) return type(uint256).max;
        return collateralValue.mul(100).div(borrowedValue);
    }
    
    /**
     * @dev Check if a position is at risk
     * @param healthFactor Current health factor
     * @return atRisk Whether the position is at risk
     */
    function _isAtRisk(uint256 healthFactor) internal view returns (bool) {
        return healthFactor <= riskThresholds.criticalHealthFactor;
    }
    
    /**
     * @dev Trigger protection for a position
     * @param positionId ID of the position
     * @param healthFactor Current health factor
     */
    function _triggerProtection(uint256 positionId, uint256 healthFactor) internal {
        LendingPosition storage position = positions[positionId];
        
        string memory riskLevel;
        if (healthFactor <= riskThresholds.criticalHealthFactor) {
            riskLevel = "CRITICAL";
        } else if (healthFactor <= riskThresholds.highRiskHealthFactor) {
            riskLevel = "HIGH";
        } else {
            riskLevel = "MEDIUM";
        }
        
        emit RiskDetected(positionId, healthFactor, riskLevel);
        
        // Mark position as protected to prevent double-triggering
        position.protected = true;
        
        // Create automatic protection action
        uint256 actionId = nextActionId++;
        string memory actionType = _determineActionType(healthFactor);
        
        protectionActions[actionId] = ProtectionAction({
            positionId: positionId,
            actionType: actionType,
            amount: _calculateProtectionAmount(position),
            priority: _calculatePriority(healthFactor),
            executed: false,
            executedAt: 0
        });
        
        emit ProtectionTriggered(positionId, actionId, actionType);
    }
    
    /**
     * @dev Determine the type of protection action needed
     * @param healthFactor Current health factor
     * @return actionType Type of action to take
     */
    function _determineActionType(uint256 healthFactor) internal view returns (string memory) {
        if (healthFactor <= riskThresholds.criticalHealthFactor) {
            return "LIQUIDATE";
        } else if (healthFactor <= riskThresholds.highRiskHealthFactor) {
            return "REPAY";
        } else {
            return "NOTIFY";
        }
    }
    
    /**
     * @dev Calculate the amount to protect
     * @param position The lending position
     * @return amount Amount to protect
     */
    function _calculateProtectionAmount(LendingPosition storage position) internal view returns (uint256) {
        uint256 shortfall = position.borrowedValue.sub(position.collateralValue);
        uint256 maxAmount = riskThresholds.maxProtectionAmount;
        
        return shortfall > maxAmount ? maxAmount : shortfall;
    }
    
    /**
     * @dev Calculate priority level for protection action
     * @param healthFactor Current health factor
     * @return priority Priority level (1-5)
     */
    function _calculatePriority(uint256 healthFactor) internal view returns (uint256) {
        if (healthFactor <= riskThresholds.criticalHealthFactor) {
            return 1; // Highest priority
        } else if (healthFactor <= riskThresholds.highRiskHealthFactor) {
            return 2;
        } else if (healthFactor <= riskThresholds.mediumRiskHealthFactor) {
            return 3;
        } else {
            return 4;
        }
    }
    
    /**
     * @dev Execute a protection action
     * @param actionId ID of the action to execute
     */
    function _executeProtection(uint256 actionId) internal {
        ProtectionAction storage action = protectionActions[actionId];
        LendingPosition storage position = positions[action.positionId];
        
        bool success = false;
        string memory result = "";
        
        try this._performProtectionAction(action) {
            success = true;
            result = "Success";
        } catch Error(string memory reason) {
            result = reason;
        } catch {
            result = "Unknown error";
        }
        
        action.executed = true;
        action.executedAt = block.timestamp;
        
        emit ProtectionExecuted(actionId, success, result);
    }
    
    /**
     * @dev Perform the actual protection action (external for try-catch)
     * @param action The protection action to perform
     */
    function _performProtectionAction(ProtectionAction memory action) external {
        LendingPosition storage position = positions[action.positionId];
        
        if (keccak256(bytes(action.actionType)) == keccak256(bytes("REPAY"))) {
            _repayLoan(position, action.amount);
        } else if (keccak256(bytes(action.actionType)) == keccak256(bytes("WITHDRAW_COLLATERAL"))) {
            _withdrawCollateral(position, action.amount);
        } else if (keccak256(bytes(action.actionType)) == keccak256(bytes("LIQUIDATE"))) {
            _liquidatePosition(position);
        } else if (keccak256(bytes(action.actionType)) == keccak256(bytes("NOTIFY"))) {
            _notifyUser(position);
        }
    }
    
    /**
     * @dev Repay a loan to improve health factor
     * @param position The lending position
     * @param amount Amount to repay
     */
    function _repayLoan(LendingPosition storage position, uint256 amount) internal {
        // This would interact with the lending pool to repay the loan
        // Implementation depends on the specific lending protocol
        // For now, we'll just log the action
        
        // TODO: Implement actual loan repayment logic
        // Example for Aave-style protocol:
        // ILendingPool lendingPool = ILendingPool(position.lendingPool);
        // lendingPool.repay(position.borrowedAsset, amount, position.user);
    }
    
    /**
     * @dev Withdraw collateral to reduce risk
     * @param position The lending position
     * @param amount Amount to withdraw
     */
    function _withdrawCollateral(LendingPosition storage position, uint256 amount) internal {
        // This would interact with the lending pool to withdraw collateral
        // Implementation depends on the specific lending protocol
        
        // TODO: Implement actual collateral withdrawal logic
    }
    
    /**
     * @dev Liquidate a position
     * @param position The lending position
     */
    function _liquidatePosition(LendingPosition storage position) internal {
        // This would trigger liquidation of the position
        // Implementation depends on the specific lending protocol
        
        // TODO: Implement actual liquidation logic
    }
    
    /**
     * @dev Notify user about risk
     * @param position The lending position
     */
    function _notifyUser(LendingPosition storage position) internal {
        // This would send a notification to the user
        // Could be via email, push notification, or on-chain event
        
        // TODO: Implement user notification system
    }

    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @dev Update risk thresholds
     * @param critical Critical health factor threshold
     * @param high High risk health factor threshold
     * @param medium Medium risk health factor threshold
     */
    function updateRiskThresholds(
        uint256 critical,
        uint256 high,
        uint256 medium
    ) external onlyOwner {
        require(critical < high && high < medium, "Aegis: Invalid threshold order");
        
        riskThresholds.criticalHealthFactor = critical;
        riskThresholds.highRiskHealthFactor = high;
        riskThresholds.mediumRiskHealthFactor = medium;
        
        emit RiskThresholdsUpdated(critical, high, medium);
    }
    
    /**
     * @dev Add a supported lending pool
     * @param lendingPool Address of the lending pool
     * @param chainId Chain where the pool exists
     */
    function addLendingPool(address lendingPool, uint256 chainId) external onlyOwner {
        supportedLendingPools[lendingPool] = true;
        chainLendingPools[chainId].push(lendingPool);
    }
    
    /**
     * @dev Remove a supported lending pool
     * @param lendingPool Address of the lending pool
     */
    function removeLendingPool(address lendingPool) external onlyOwner {
        supportedLendingPools[lendingPool] = false;
    }
    
    /**
     * @dev Set AI Oracle address
     * @param _aiOracle Address of the AI Oracle
     */
    function setAIOracle(address _aiOracle) external onlyOwner {
        aiOracle = _aiOracle;
    }

    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get all positions for a user
     * @param user Address of the user
     * @return positionIds Array of position IDs
     */
    function getUserPositions(address user) external view returns (uint256[] memory positionIds) {
        return userPositions[user];
    }
    
    /**
     * @dev Get protection actions for a position
     * @param positionId ID of the position
     * @return actions Array of protection actions
     */
    function getPositionProtectionActions(uint256 positionId) external view returns (uint256[] memory actions) {
        uint256 count = 0;
        for (uint i = 0; i < nextActionId; i++) {
            if (protectionActions[i].positionId == positionId) {
                count++;
            }
        }
        
        actions = new uint256[](count);
        uint256 index = 0;
        for (uint i = 0; i < nextActionId; i++) {
            if (protectionActions[i].positionId == positionId) {
                actions[index] = i;
                index++;
            }
        }
    }
    
    /**
     * @dev Check if a position is at risk
     * @param positionId ID of the position
     * @return atRisk Whether the position is at risk
     */
    function isPositionAtRisk(uint256 positionId) external view returns (bool atRisk) {
        return positions[positionId].atRisk;
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
        // Handle cross-chain protection actions
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