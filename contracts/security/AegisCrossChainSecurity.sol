// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./AegisSecurityBase.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";

/**
 * @title AegisCrossChainSecurity
 * @dev Secure cross-chain messaging with ZetaChain Gateway integration
 * - Authenticated cross-chain message validation
 * - Replay attack prevention
 * - Message integrity verification
 * - Rate limiting per chain
 */
contract AegisCrossChainSecurity is AegisSecurityBase {
    using ECDSA for bytes32;
    using MessageHashUtils for bytes32;

    // ZetaChain Gateway interface
    interface IZetaGateway {
        function isAuthorizedSender(address sender) external view returns (bool);
        function getChainId() external view returns (uint256);
        function validateMessage(bytes calldata message, bytes calldata signature) external view returns (bool);
    }

    // Cross-chain message structure
    struct CrossChainMessage {
        uint256 sourceChainId;
        uint256 targetChainId;
        uint256 nonce;
        uint256 timestamp;
        address sender;
        string action;
        bytes payload;
        bytes32 messageHash;
    }

    // Security state
    mapping(bytes32 => bool) public processedMessages;
    mapping(uint256 => uint256) public chainNonces;
    mapping(uint256 => mapping(address => uint256)) public chainUserNonces;
    
    // ZetaChain configuration
    IZetaGateway public zetaGateway;
    uint256 public zetaChainId;
    uint256 public constant MESSAGE_TIMEOUT = 1 hours;
    uint256 public constant MAX_PAYLOAD_SIZE = 1024;
    
    // Events
    event CrossChainMessageReceived(
        uint256 indexed sourceChainId,
        uint256 indexed targetChainId,
        address indexed sender,
        string action,
        bytes32 messageHash
    );
    
    event CrossChainMessageSent(
        uint256 indexed sourceChainId,
        uint256 indexed targetChainId,
        address indexed sender,
        string action,
        bytes32 messageHash
    );
    
    event MessageValidationFailed(
        bytes32 indexed messageHash,
        string reason
    );
    
    event ReplayAttackDetected(
        bytes32 indexed messageHash,
        address indexed attacker
    );

    constructor(
        address admin,
        address _zetaGateway,
        uint256 _zetaChainId
    ) AegisSecurityBase(admin) {
        zetaGateway = IZetaGateway(_zetaGateway);
        zetaChainId = _zetaChainId;
    }

    /**
     * @dev Send cross-chain message to ZetaChain
     */
    function sendCrossChainMessage(
        uint256 targetChainId,
        string memory action,
        bytes memory payload
    ) external nonReentrant whenNotPaused whenNotEmergency rateLimited securityCheck {
        require(targetChainId != block.chainid, "Cannot send to same chain");
        require(targetChainId == zetaChainId, "Only ZetaChain supported");
        require(payload.length <= MAX_PAYLOAD_SIZE, "Payload too large");
        
        // Generate unique nonce
        uint256 nonce = ++chainUserNonces[targetChainId][msg.sender];
        
        // Create message
        CrossChainMessage memory message = CrossChainMessage({
            sourceChainId: block.chainid,
            targetChainId: targetChainId,
            nonce: nonce,
            timestamp: block.timestamp,
            sender: msg.sender,
            action: action,
            payload: payload,
            messageHash: bytes32(0)
        });
        
        // Hash the message
        message.messageHash = _hashMessage(message);
        
        // Emit event
        emit CrossChainMessageSent(
            message.sourceChainId,
            message.targetChainId,
            message.sender,
            message.action,
            message.messageHash
        );
        
        // Log security event
        _logSecurityAlert("CROSS_CHAIN_MESSAGE_SENT", msg.sender, action);
    }

    /**
     * @dev Receive and validate cross-chain message from ZetaChain
     */
    function onZetaMessage(
        bytes calldata message,
        bytes calldata signature
    ) external nonReentrant whenNotPaused whenNotEmergency {
        require(msg.sender == address(zetaGateway), "Only ZetaGateway can call");
        
        // Decode message
        CrossChainMessage memory decodedMessage = _decodeMessage(message);
        
        // Validate message
        if (!_validateMessage(decodedMessage, signature)) {
            emit MessageValidationFailed(decodedMessage.messageHash, "Validation failed");
            _logSecurityAlert("MESSAGE_VALIDATION_FAILED", decodedMessage.sender, "Invalid signature or format");
            return;
        }
        
        // Check for replay attacks
        if (processedMessages[decodedMessage.messageHash]) {
            emit ReplayAttackDetected(decodedMessage.messageHash, decodedMessage.sender);
            _logSecurityAlert("REPLAY_ATTACK_DETECTED", decodedMessage.sender, "Duplicate message hash");
            return;
        }
        
        // Check message timeout
        if (block.timestamp - decodedMessage.timestamp > MESSAGE_TIMEOUT) {
            emit MessageValidationFailed(decodedMessage.messageHash, "Message expired");
            _logSecurityAlert("MESSAGE_EXPIRED", decodedMessage.sender, "Message timestamp too old");
            return;
        }
        
        // Mark message as processed
        processedMessages[decodedMessage.messageHash] = true;
        
        // Process the message
        _processCrossChainMessage(decodedMessage);
        
        // Emit success event
        emit CrossChainMessageReceived(
            decodedMessage.sourceChainId,
            decodedMessage.targetChainId,
            decodedMessage.sender,
            decodedMessage.action,
            decodedMessage.messageHash
        );
    }

    /**
     * @dev Validate cross-chain message
     */
    function _validateMessage(
        CrossChainMessage memory message,
        bytes calldata signature
    ) internal view returns (bool) {
        // Check chain IDs
        if (message.sourceChainId == 0 || message.targetChainId != block.chainid) {
            return false;
        }
        
        // Check timestamp
        if (message.timestamp > block.timestamp) {
            return false;
        }
        
        // Check sender
        if (message.sender == address(0)) {
            return false;
        }
        
        // Validate signature through ZetaGateway
        return zetaGateway.validateMessage(
            abi.encode(message),
            signature
        );
    }

    /**
     * @dev Process validated cross-chain message
     */
    function _processCrossChainMessage(CrossChainMessage memory message) internal {
        // Parse action and payload
        if (keccak256(bytes(message.action)) == keccak256("marginCall")) {
            _handleMarginCall(message);
        } else if (keccak256(bytes(message.action)) == keccak256("liquidation")) {
            _handleLiquidation(message);
        } else if (keccak256(bytes(message.action)) == keccak256("securityAlert")) {
            _handleSecurityAlert(message);
        } else {
            _logSecurityAlert("UNKNOWN_ACTION", message.sender, message.action);
        }
    }

    /**
     * @dev Handle margin call from cross-chain
     */
    function _handleMarginCall(CrossChainMessage memory message) internal {
        // Decode margin call data
        (address user, uint256 amount, uint256 threshold) = abi.decode(
            message.payload,
            (address, uint256, uint256)
        );
        
        // Log security event
        _logSecurityAlert("CROSS_CHAIN_MARGIN_CALL", user, 
            string(abi.encodePacked("Amount: ", _uint2str(amount), " Threshold: ", _uint2str(threshold)))
        );
        
        // Additional margin call logic would go here
    }

    /**
     * @dev Handle liquidation from cross-chain
     */
    function _handleLiquidation(CrossChainMessage memory message) internal {
        // Decode liquidation data
        (address user, address collateral, uint256 amount) = abi.decode(
            message.payload,
            (address, address, uint256)
        );
        
        // Log security event
        _logSecurityAlert("CROSS_CHAIN_LIQUIDATION", user,
            string(abi.encodePacked("Collateral: ", _address2str(collateral), " Amount: ", _uint2str(amount)))
        );
        
        // Additional liquidation logic would go here
    }

    /**
     * @dev Handle security alert from cross-chain
     */
    function _handleSecurityAlert(CrossChainMessage memory message) internal {
        // Decode security alert data
        (string memory alertType, string memory details) = abi.decode(
            message.payload,
            (string, string)
        );
        
        // Log security event
        _logSecurityAlert("CROSS_CHAIN_SECURITY_ALERT", message.sender,
            string(abi.encodePacked(alertType, ": ", details))
        );
        
        // Additional security alert logic would go here
    }

    /**
     * @dev Hash cross-chain message for validation
     */
    function _hashMessage(CrossChainMessage memory message) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            message.sourceChainId,
            message.targetChainId,
            message.nonce,
            message.timestamp,
            message.sender,
            message.action,
            message.payload
        ));
    }

    /**
     * @dev Decode cross-chain message from bytes
     */
    function _decodeMessage(bytes calldata message) internal pure returns (CrossChainMessage memory) {
        return abi.decode(message, (CrossChainMessage));
    }

    /**
     * @dev Check if message has been processed
     */
    function isMessageProcessed(bytes32 messageHash) external view returns (bool) {
        return processedMessages[messageHash];
    }

    /**
     * @dev Get chain nonce for specific chain
     */
    function getChainNonce(uint256 chainId) external view returns (uint256) {
        return chainNonces[chainId];
    }

    /**
     * @dev Get user nonce for specific chain
     */
    function getUserChainNonce(uint256 chainId, address user) external view returns (uint256) {
        return chainUserNonces[chainId][user];
    }

    /**
     * @dev Emergency function to pause cross-chain messaging
     */
    function emergencyPauseCrossChain() external onlyEmergency {
        _pause();
        _logSecurityAlert("CROSS_CHAIN_PAUSED", msg.sender, "Emergency pause activated");
    }

    /**
     * @dev Update ZetaChain gateway address
     */
    function updateZetaGateway(address newGateway) external onlyAdmin {
        require(newGateway != address(0), "Invalid gateway address");
        zetaGateway = IZetaGateway(newGateway);
        _logSecurityAlert("GATEWAY_UPDATED", msg.sender, "ZetaChain gateway updated");
    }

    /**
     * @dev Utility function to convert uint to string
     */
    function _uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k -= 1;
            uint8 temp = (48 + uint8(_i - _i / 10 * 10));
            bytes1 b1 = bytes1(temp);
            bstr[k] = b1;
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * @dev Utility function to convert address to string
     */
    function _address2str(address _addr) internal pure returns (string memory) {
        return _uint2str(uint256(uint160(_addr)));
    }
}
