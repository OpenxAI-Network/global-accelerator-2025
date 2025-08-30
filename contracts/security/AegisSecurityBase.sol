// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title AegisSecurityBase
 * @dev Base contract providing security features for all Aegis contracts
 * - Reentrancy protection
 * - Role-based access control
 * - Circuit breaker (emergency stop)
 * - Rate limiting
 * - Event logging for security monitoring
 */
contract AegisSecurityBase is ReentrancyGuard, AccessControl, Pausable {
    using Counters for Counters.Counter;

    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");
    
    // Security state
    bool public emergencyMode;
    uint256 public lastSecurityCheck;
    uint256 public constant SECURITY_CHECK_INTERVAL = 1 hours;
    
    // Rate limiting
    mapping(address => uint256) public userLastAction;
    mapping(address => uint256) public userActionCount;
    uint256 public constant RATE_LIMIT_WINDOW = 1 hours;
    uint256 public constant MAX_ACTIONS_PER_WINDOW = 100;
    
    // Events for security monitoring
    event SecurityAlert(string alertType, address indexed user, string details);
    event EmergencyModeActivated(address indexed by, string reason);
    event EmergencyModeDeactivated(address indexed by);
    event RateLimitExceeded(address indexed user, uint256 actionCount);
    event SecurityCheckPerformed(uint256 timestamp, bool passed);
    
    // Modifiers
    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "AegisSecurity: Admin role required");
        _;
    }
    
    modifier onlyOperator() {
        require(hasRole(OPERATOR_ROLE, msg.sender), "AegisSecurity: Operator role required");
        _;
    }
    
    modifier onlyEmergency() {
        require(hasRole(EMERGENCY_ROLE, msg.sender), "AegisSecurity: Emergency role required");
        _;
    }
    
    modifier whenNotEmergency() {
        require(!emergencyMode, "AegisSecurity: Contract in emergency mode");
        _;
    }
    
    modifier rateLimited() {
        require(_checkRateLimit(msg.sender), "AegisSecurity: Rate limit exceeded");
        _;
    }
    
    modifier securityCheck() {
        require(_performSecurityCheck(), "AegisSecurity: Security check failed");
        _;
    }

    constructor(address admin) {
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE, admin);
        _grantRole(EMERGENCY_ROLE, admin);
        lastSecurityCheck = block.timestamp;
    }

    /**
     * @dev Activate emergency mode - only emergency role can call
     */
    function activateEmergencyMode(string memory reason) external onlyEmergency {
        emergencyMode = true;
        _pause();
        emit EmergencyModeActivated(msg.sender, reason);
        emit SecurityAlert("EMERGENCY_MODE_ACTIVATED", msg.sender, reason);
    }

    /**
     * @dev Deactivate emergency mode - only admin can call
     */
    function deactivateEmergencyMode() external onlyAdmin {
        emergencyMode = false;
        _unpause();
        emit EmergencyModeDeactivated(msg.sender);
    }

    /**
     * @dev Grant emergency role to address
     */
    function grantEmergencyRole(address account) external onlyAdmin {
        _grantRole(EMERGENCY_ROLE, account);
    }

    /**
     * @dev Revoke emergency role from address
     */
    function revokeEmergencyRole(address account) external onlyAdmin {
        _revokeRole(EMERGENCY_ROLE, account);
    }

    /**
     * @dev Check and update rate limiting for user
     */
    function _checkRateLimit(address user) internal returns (bool) {
        uint256 now = block.timestamp;
        
        // Reset counter if window has passed
        if (now - userLastAction[user] >= RATE_LIMIT_WINDOW) {
            userActionCount[user] = 0;
        }
        
        // Check if user has exceeded limit
        if (userActionCount[user] >= MAX_ACTIONS_PER_WINDOW) {
            emit RateLimitExceeded(user, userActionCount[user]);
            emit SecurityAlert("RATE_LIMIT_EXCEEDED", user, "User exceeded action limit");
            return false;
        }
        
        // Update counters
        userActionCount[user]++;
        userLastAction[user] = now;
        
        return true;
    }

    /**
     * @dev Perform security check - can be overridden by child contracts
     */
    function _performSecurityCheck() internal returns (bool) {
        // Basic check: ensure contract hasn't been paused for too long
        if (paused() && block.timestamp - lastSecurityCheck > SECURITY_CHECK_INTERVAL) {
            emit SecurityAlert("SECURITY_CHECK_FAILED", address(0), "Contract paused too long");
            return false;
        }
        
        lastSecurityCheck = block.timestamp;
        emit SecurityCheckPerformed(block.timestamp, true);
        return true;
    }

    /**
     * @dev Log security alert
     */
    function _logSecurityAlert(string memory alertType, address user, string memory details) internal {
        emit SecurityAlert(alertType, user, details);
    }

    /**
     * @dev Get user's current action count
     */
    function getUserActionCount(address user) external view returns (uint256) {
        if (block.timestamp - userLastAction[user] >= RATE_LIMIT_WINDOW) {
            return 0;
        }
        return userActionCount[user];
    }

    /**
     * @dev Get time until rate limit resets for user
     */
    function getRateLimitResetTime(address user) external view returns (uint256) {
        if (userLastAction[user] == 0) return 0;
        uint256 resetTime = userLastAction[user] + RATE_LIMIT_WINDOW;
        return resetTime > block.timestamp ? resetTime - block.timestamp : 0;
    }
}
