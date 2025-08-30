// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/UniversalContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title BitcoinConnector
 * @dev Connector contract for handling native Bitcoin deposits and UTXO management
 * This contract integrates with ZetaChain's Bitcoin connector for native BTC support
 */
contract BitcoinConnector is UniversalContract, Ownable, ReentrancyGuard {
    
    // Bitcoin UTXO structure
    struct BitcoinUTXO {
        bytes32 txHash;
        uint32 outputIndex;
        uint256 amount; // Satoshis
        bytes btcAddress;
        bool isLocked;
        uint256 lockTimestamp;
        address owner; // ZetaChain address
    }
    
    // AEGIS protocol contract address
    address public aegisProtocol;
    
    // UTXO tracking
    mapping(bytes32 => BitcoinUTXO) public utxos;
    mapping(address => bytes32[]) public userUTXOs;
    mapping(bytes => address) public btcAddressToOwner;
    
    // Bitcoin chain ID
    uint256 public constant BITCOIN_CHAIN_ID = 18332; // Bitcoin testnet
    
    // Events
    event BitcoinDeposited(
        bytes32 indexed utxoId,
        bytes btcAddress,
        address indexed owner,
        uint256 amount
    );
    
    event UTXOLocked(
        bytes32 indexed utxoId,
        address indexed owner,
        uint256 amount
    );
    
    event UTXOUnlocked(
        bytes32 indexed utxoId,
        address indexed owner,
        uint256 amount
    );
    
    event UTXOLiquidated(
        bytes32 indexed utxoId,
        address indexed liquidator,
        uint256 amount
    );
    
    // Modifiers
    modifier onlyAegisProtocol() {
        require(msg.sender == aegisProtocol, "Only AEGIS protocol");
        _;
    }
    
    modifier onlyValidUTXO(bytes32 utxoId) {
        require(utxos[utxoId].txHash != bytes32(0), "UTXO not found");
        _;
    }
    
    constructor(address systemContract) UniversalContract(systemContract) {}
    
    // ==================== UNIVERSAL CONTRACT IMPLEMENTATION ====================
    
    /**
     * @dev Handle incoming Bitcoin deposits from ZetaChain
     */
    function onCall(
        MessageContext calldata context,
        address zrc20,
        uint256 amount,
        bytes calldata message
    ) external override onlyGateway {
        // Decode Bitcoin deposit message
        (bytes32 txHash, uint32 outputIndex, bytes memory btcAddress, address owner) = abi.decode(
            message,
            (bytes32, uint32, bytes, address)
        );
        
        // Create UTXO ID
        bytes32 utxoId = keccak256(abi.encodePacked(txHash, outputIndex));
        
        // Store UTXO
        utxos[utxoId] = BitcoinUTXO({
            txHash: txHash,
            outputIndex: outputIndex,
            amount: amount,
            btcAddress: btcAddress,
            isLocked: false,
            lockTimestamp: 0,
            owner: owner
        });
        
        // Track user UTXOs
        userUTXOs[owner].push(utxoId);
        btcAddressToOwner[btcAddress] = owner;
        
        emit BitcoinDeposited(utxoId, btcAddress, owner, amount);
        
        // Notify AEGIS protocol
        _notifyAegisProtocol(owner, btcAddress, amount);
    }
    
    // ==================== UTXO MANAGEMENT ====================
    
    /**
     * @dev Lock UTXO for collateral
     */
    function lockUTXO(bytes32 utxoId) external onlyValidUTXO(utxoId) {
        BitcoinUTXO storage utxo = utxos[utxoId];
        require(utxo.owner == msg.sender, "Not UTXO owner");
        require(!utxo.isLocked, "UTXO already locked");
        
        utxo.isLocked = true;
        utxo.lockTimestamp = block.timestamp;
        
        emit UTXOLocked(utxoId, msg.sender, utxo.amount);
    }
    
    /**
     * @dev Unlock UTXO after loan repayment
     */
    function unlockUTXO(bytes32 utxoId) external onlyAegisProtocol onlyValidUTXO(utxoId) {
        BitcoinUTXO storage utxo = utxos[utxoId];
        require(utxo.isLocked, "UTXO not locked");
        
        utxo.isLocked = false;
        utxo.lockTimestamp = 0;
        
        emit UTXOUnlocked(utxoId, utxo.owner, utxo.amount);
    }
    
    /**
     * @dev Liquidate UTXO (called by AEGIS protocol)
     */
    function liquidateUTXO(
        bytes32 utxoId,
        address liquidator
    ) external onlyAegisProtocol onlyValidUTXO(utxoId) {
        BitcoinUTXO storage utxo = utxos[utxoId];
        require(utxo.isLocked, "UTXO not locked");
        
        // Transfer ownership to liquidator
        address previousOwner = utxo.owner;
        utxo.owner = liquidator;
        utxo.isLocked = false;
        utxo.lockTimestamp = 0;
        
        // Update user tracking
        _removeUserUTXO(previousOwner, utxoId);
        userUTXOs[liquidator].push(utxoId);
        
        emit UTXOLiquidated(utxoId, liquidator, utxo.amount);
    }
    
    /**
     * @dev Transfer UTXO to another address
     */
    function transferUTXO(
        bytes32 utxoId,
        address newOwner
    ) external onlyValidUTXO(utxoId) {
        BitcoinUTXO storage utxo = utxos[utxoId];
        require(utxo.owner == msg.sender, "Not UTXO owner");
        require(!utxo.isLocked, "UTXO is locked");
        require(newOwner != address(0), "Invalid new owner");
        
        // Update ownership
        address previousOwner = utxo.owner;
        utxo.owner = newOwner;
        
        // Update tracking
        _removeUserUTXO(previousOwner, utxoId);
        userUTXOs[newOwner].push(utxoId);
        
        // Update BTC address mapping if needed
        if (btcAddressToOwner[utxo.btcAddress] == previousOwner) {
            btcAddressToOwner[utxo.btcAddress] = newOwner;
        }
    }
    
    // ==================== CROSS-CHAIN OPERATIONS ====================
    
    /**
     * @dev Send Bitcoin to external address
     */
    function sendBitcoin(
        bytes32 utxoId,
        bytes memory targetBtcAddress,
        uint256 amount
    ) external onlyValidUTXO(utxoId) {
        BitcoinUTXO storage utxo = utxos[utxoId];
        require(utxo.owner == msg.sender, "Not UTXO owner");
        require(!utxo.isLocked, "UTXO is locked");
        require(amount <= utxo.amount, "Amount exceeds UTXO");
        
        // Create new UTXO for change if needed
        if (amount < utxo.amount) {
            uint256 change = utxo.amount - amount;
            bytes32 changeUtxoId = keccak256(abi.encodePacked(
                utxo.txHash,
                utxo.outputIndex,
                block.timestamp
            ));
            
            utxos[changeUtxoId] = BitcoinUTXO({
                txHash: utxo.txHash,
                outputIndex: utxo.outputIndex,
                amount: change,
                btcAddress: utxo.btcAddress,
                isLocked: false,
                lockTimestamp: 0,
                owner: msg.sender
            });
            
            userUTXOs[msg.sender].push(changeUtxoId);
        }
        
        // Remove original UTXO
        _removeUserUTXO(msg.sender, utxoId);
        delete utxos[utxoId];
        
        // Send cross-chain message to Bitcoin network
        _sendBitcoinTransaction(targetBtcAddress, amount);
    }
    
    /**
     * @dev Send cross-chain Bitcoin transaction
     */
    function _sendBitcoinTransaction(bytes memory targetAddress, uint256 amount) internal {
        bytes memory message = abi.encodeWithSignature(
            "sendBitcoin(bytes,uint256)",
            targetAddress,
            amount
        );
        
        // Send through ZetaChain to Bitcoin network
        systemContract.interchainCall(
            BITCOIN_CHAIN_ID,
            address(this), // Target contract on Bitcoin
            0, // No gas on Bitcoin
            message
        );
    }
    
    // ==================== INTERNAL FUNCTIONS ====================
    
    /**
     * @dev Remove UTXO from user's list
     */
    function _removeUserUTXO(address user, bytes32 utxoId) internal {
        uint256[] storage userUtxoList = userUTXOs[user];
        for (uint256 i = 0; i < userUtxoList.length; i++) {
            if (userUtxoList[i] == utxoId) {
                userUtxoList[i] = userUtxoList[userUtxoList.length - 1];
                userUtxoList.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Notify AEGIS protocol of Bitcoin deposit
     */
    function _notifyAegisProtocol(
        address owner,
        bytes memory btcAddress,
        uint256 amount
    ) internal {
        if (aegisProtocol != address(0)) {
            bytes memory message = abi.encodeWithSignature(
                "handleBitcoinDeposit(address,bytes,uint256)",
                owner,
                btcAddress,
                amount
            );
            
            // Send message to AEGIS protocol
            systemContract.interchainCall(
                block.chainid, // Current chain (ZetaChain)
                aegisProtocol,
                100000, // Gas limit
                message
            );
        }
    }
    
    // ==================== ADMIN FUNCTIONS ====================
    
    /**
     * @dev Set AEGIS protocol address
     */
    function setAegisProtocol(address _aegisProtocol) external onlyOwner {
        aegisProtocol = _aegisProtocol;
    }
    
    /**
     * @dev Emergency pause
     */
    function emergencyPause() external onlyOwner {
        // Implementation for emergency pause
    }
    
    // ==================== VIEW FUNCTIONS ====================
    
    /**
     * @dev Get user's UTXOs
     */
    function getUserUTXOs(address user) external view returns (bytes32[] memory) {
        return userUTXOs[user];
    }
    
    /**
     * @dev Get UTXO details
     */
    function getUTXO(bytes32 utxoId) external view returns (BitcoinUTXO memory) {
        return utxos[utxoId];
    }
    
    /**
     * @dev Get user's total Bitcoin balance
     */
    function getUserBitcoinBalance(address user) external view returns (uint256) {
        uint256[] memory userUtxoList = userUTXOs[user];
        uint256 total = 0;
        
        for (uint256 i = 0; i < userUtxoList.length; i++) {
            BitcoinUTXO storage utxo = utxos[userUtxoList[i]];
            if (!utxo.isLocked) {
                total += utxo.amount;
            }
        }
        
        return total;
    }
    
    /**
     * @dev Get locked UTXOs for user
     */
    function getLockedUTXOs(address user) external view returns (bytes32[] memory) {
        uint256[] memory userUtxoList = userUTXOs[user];
        bytes32[] memory lockedUtxos = new bytes32[](userUtxoList.length);
        uint256 lockedCount = 0;
        
        for (uint256 i = 0; i < userUtxoList.length; i++) {
            BitcoinUTXO storage utxo = utxos[userUtxoList[i]];
            if (utxo.isLocked) {
                lockedUtxos[lockedCount] = userUtxoList[i];
                lockedCount++;
            }
        }
        
        // Resize array to actual count
        assembly {
            mstore(lockedUtxos, lockedCount)
        }
        
        return lockedUtxos;
    }
    
    /**
     * @dev Check if BTC address is owned by user
     */
    function isBtcAddressOwned(bytes memory btcAddress, address user) external view returns (bool) {
        return btcAddressToOwner[btcAddress] == user;
    }
} 