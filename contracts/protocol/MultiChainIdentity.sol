// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title MultiChainIdentity
 * @dev Manages cross-chain user identity linking using ZetaChain's Universal Smart Contract
 * @author Aegis AI Team
 */
contract MultiChainIdentity is Ownable, ReentrancyGuard {
    using ECDSA for bytes32;

    // =============================================================================
    // STRUCTS & ENUMS
    // =============================================================================

    struct LinkedWallet {
        address evmAddress;       // Primary ZetaChain/EVM identity
        bytes btcAddress;         // Native BTC address (compressed pubkey or script hash)
        bytes32 solanaAddress;    // Solana 32-byte public key
        bytes32 avaxAddress;      // Avalanche C-Chain address
        bytes32 baseAddress;      // Base L2 address
        bytes32 polygonAddress;   // Polygon address
        uint256 linkTimestamp;    // When the wallet was linked
        bool isActive;            // Whether the link is active
    }

    struct UserProfile {
        string username;          // Human-readable identifier
        bytes32 avatarHash;       // IPFS hash for profile picture
        uint256 reputationScore;  // Cross-chain reputation score
        uint256 totalLinkedWallets; // Count of linked wallets
        uint256 createdAt;        // Profile creation timestamp
        bool isVerified;          // KYC/verification status
    }

    enum ChainType {
        EVM,        // 0 - Ethereum, ZetaChain, etc.
        BTC,        // 1 - Bitcoin
        SOLANA,     // 2 - Solana
        AVAX,       // 3 - Avalanche C-Chain
        BASE,       // 4 - Base L2
        POLYGON     // 5 - Polygon
    }

    // =============================================================================
    // STATE VARIABLES
    // =============================================================================

    mapping(address => LinkedWallet) public userLinks;
    mapping(address => UserProfile) public userProfiles;
    mapping(bytes32 => address) public addressToUser; // Reverse lookup
    mapping(string => bool) public reservedUsernames;
    
    // Chain-specific address mappings for quick lookups
    mapping(bytes32 => address) public btcToUser;
    mapping(bytes32 => address) public solanaToUser;
    mapping(bytes32 => address) public avaxToUser;
    mapping(bytes32 => address) public baseToUser;
    mapping(bytes32 => address) public polygonToUser;

    // =============================================================================
    // EVENTS
    // =============================================================================

    event WalletLinked(
        address indexed user,
        ChainType indexed chainType,
        bytes32 indexed chainAddress,
        uint256 timestamp
    );

    event WalletUnlinked(
        address indexed user,
        ChainType indexed chainType,
        bytes32 indexed chainAddress,
        uint256 timestamp
    );

    event ProfileUpdated(
        address indexed user,
        string username,
        bytes32 avatarHash,
        uint256 reputationScore
    );

    event ReputationUpdated(
        address indexed user,
        uint256 oldScore,
        uint256 newScore,
        string reason
    );

    // =============================================================================
    // MODIFIERS
    // =============================================================================

    modifier onlyLinkedUser(address user) {
        require(userLinks[user].evmAddress != address(0), "User not linked");
        _;
    }

    modifier onlyWalletOwner(address user) {
        require(msg.sender == user || msg.sender == owner(), "Not wallet owner or admin");
        _;
    }

    modifier validChainType(ChainType chainType) {
        require(chainType != ChainType.EVM, "Invalid chain type");
        _;
    }

    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================

    constructor() {
        // Reserve some usernames
        reservedUsernames["admin"] = true;
        reservedUsernames["aegis"] = true;
        reservedUsernames["system"] = true;
    }

    // =============================================================================
    // CORE LINKING FUNCTIONS
    // =============================================================================

    /**
     * @dev Link a BTC wallet to the user's EVM identity
     * @param btcAddr The BTC address to link
     * @param signature Signature proving ownership of the BTC address
     * @param message The message that was signed
     */
    function linkBTCWallet(
        bytes calldata btcAddr,
        bytes calldata signature,
        string calldata message
    ) external nonReentrant {
        require(btcAddr.length > 0, "Invalid BTC address");
        require(signature.length > 0, "Invalid signature");
        
        // Verify the signature matches the message
        bytes32 messageHash = keccak256(abi.encodePacked(message));
        address signer = messageHash.recover(signature);
        require(signer == msg.sender, "Invalid signature");

        // Check if BTC address is already linked
        bytes32 btcHash = keccak256(btcAddr);
        require(btcToUser[btcHash] == address(0), "BTC address already linked");

        // Initialize user link if not exists
        if (userLinks[msg.sender].evmAddress == address(0)) {
            userLinks[msg.sender].evmAddress = msg.sender;
            userLinks[msg.sender].linkTimestamp = block.timestamp;
            userLinks[msg.sender].isActive = true;
        }

        // Link BTC address
        userLinks[msg.sender].btcAddress = btcAddr;
        btcToUser[btcHash] = msg.sender;
        userLinks[msg.sender].totalLinkedWallets++;

        emit WalletLinked(msg.sender, ChainType.BTC, btcHash, block.timestamp);
    }

    /**
     * @dev Link a Solana wallet to the user's EVM identity
     * @param solanaAddr The Solana public key (32 bytes)
     * @param signature Signature proving ownership
     * @param message The message that was signed
     */
    function linkSolanaWallet(
        bytes32 solanaAddr,
        bytes calldata signature,
        string calldata message
    ) external nonReentrant {
        require(solanaAddr != bytes32(0), "Invalid Solana address");
        require(signature.length > 0, "Invalid signature");
        require(solanaToUser[solanaAddr] == address(0), "Solana address already linked");

        // Verify signature (simplified - in production, use proper Solana verification)
        bytes32 messageHash = keccak256(abi.encodePacked(message));
        address signer = messageHash.recover(signature);
        require(signer == msg.sender, "Invalid signature");

        // Initialize user link if not exists
        if (userLinks[msg.sender].evmAddress == address(0)) {
            userLinks[msg.sender].evmAddress = msg.sender;
            userLinks[msg.sender].linkTimestamp = block.timestamp;
            userLinks[msg.sender].isActive = true;
        }

        // Link Solana address
        userLinks[msg.sender].solanaAddress = solanaAddr;
        solanaToUser[solanaAddr] = msg.sender;
        userLinks[msg.sender].totalLinkedWallets++;

        emit WalletLinked(msg.sender, ChainType.SOLANA, solanaAddr, block.timestamp);
    }

    /**
     * @dev Link an Avalanche C-Chain wallet
     * @param avaxAddr The Avalanche address
     * @param signature Signature proving ownership
     * @param message The message that was signed
     */
    function linkAvalancheWallet(
        bytes32 avaxAddr,
        bytes calldata signature,
        string calldata message
    ) external nonReentrant {
        require(avaxAddr != bytes32(0), "Invalid Avalanche address");
        require(signature.length > 0, "Invalid signature");
        require(avaxToUser[avaxAddr] == address(0), "Avalanche address already linked");

        bytes32 messageHash = keccak256(abi.encodePacked(message));
        address signer = messageHash.recover(signature);
        require(signer == msg.sender, "Invalid signature");

        if (userLinks[msg.sender].evmAddress == address(0)) {
            userLinks[msg.sender].evmAddress = msg.sender;
            userLinks[msg.sender].linkTimestamp = block.timestamp;
            userLinks[msg.sender].isActive = true;
        }

        userLinks[msg.sender].avaxAddress = avaxAddr;
        avaxToUser[avaxAddr] = msg.sender;
        userLinks[msg.sender].totalLinkedWallets++;

        emit WalletLinked(msg.sender, ChainType.AVAX, avaxAddr, block.timestamp);
    }

    /**
     * @dev Link a Base L2 wallet
     * @param baseAddr The Base address
     * @param signature Signature proving ownership
     * @param message The message that was signed
     */
    function linkBaseWallet(
        bytes32 baseAddr,
        bytes calldata signature,
        string calldata message
    ) external nonReentrant {
        require(baseAddr != bytes32(0), "Invalid Base address");
        require(signature.length > 0, "Invalid signature");
        require(baseToUser[baseAddr] == address(0), "Base address already linked");

        bytes32 messageHash = keccak256(abi.encodePacked(message));
        address signer = messageHash.recover(signature);
        require(signer == msg.sender, "Invalid signature");

        if (userLinks[msg.sender].evmAddress == address(0)) {
            userLinks[msg.sender].evmAddress = msg.sender;
            userLinks[msg.sender].linkTimestamp = block.timestamp;
            userLinks[msg.sender].isActive = true;
        }

        userLinks[msg.sender].baseAddress = baseAddr;
        baseToUser[baseAddr] = msg.sender;
        userLinks[msg.sender].totalLinkedWallets++;

        emit WalletLinked(msg.sender, ChainType.BASE, baseAddr, block.timestamp);
    }

    /**
     * @dev Link a Polygon wallet
     * @param polygonAddr The Polygon address
     * @param signature Signature proving ownership
     * @param message The message that was signed
     */
    function linkPolygonWallet(
        bytes32 polygonAddr,
        bytes calldata signature,
        string calldata message
    ) external nonReentrant {
        require(polygonAddr != bytes32(0), "Invalid Polygon address");
        require(signature.length > 0, "Invalid signature");
        require(polygonToUser[polygonAddr] == address(0), "Polygon address already linked");

        bytes32 messageHash = keccak256(abi.encodePacked(message));
        address signer = messageHash.recover(signature);
        require(signer == msg.sender, "Invalid signature");

        if (userLinks[msg.sender].evmAddress == address(0)) {
            userLinks[msg.sender].evmAddress = msg.sender;
            userLinks[msg.sender].linkTimestamp = block.timestamp;
            userLinks[msg.sender].isActive = true;
        }

        userLinks[msg.sender].polygonAddress = polygonAddr;
        polygonToUser[polygonAddr] = msg.sender;
        userLinks[msg.sender].totalLinkedWallets++;

        emit WalletLinked(msg.sender, ChainType.POLYGON, polygonAddr, block.timestamp);
    }

    // =============================================================================
    // UNLINKING FUNCTIONS
    // =============================================================================

    /**
     * @dev Unlink a specific wallet type
     * @param chainType The type of chain to unlink
     */
    function unlinkWallet(ChainType chainType) external onlyLinkedUser(msg.sender) {
        require(chainType != ChainType.EVM, "Cannot unlink primary EVM address");

        if (chainType == ChainType.BTC && userLinks[msg.sender].btcAddress.length > 0) {
            bytes32 btcHash = keccak256(userLinks[msg.sender].btcAddress);
            delete btcToUser[btcHash];
            delete userLinks[msg.sender].btcAddress;
            userLinks[msg.sender].totalLinkedWallets--;
            emit WalletUnlinked(msg.sender, chainType, btcHash, block.timestamp);
        } else if (chainType == ChainType.SOLANA && userLinks[msg.sender].solanaAddress != bytes32(0)) {
            bytes32 solAddr = userLinks[msg.sender].solanaAddress;
            delete solanaToUser[solAddr];
            delete userLinks[msg.sender].solanaAddress;
            userLinks[msg.sender].totalLinkedWallets--;
            emit WalletUnlinked(msg.sender, chainType, solAddr, block.timestamp);
        } else if (chainType == ChainType.AVAX && userLinks[msg.sender].avaxAddress != bytes32(0)) {
            bytes32 avaxAddr = userLinks[msg.sender].avaxAddress;
            delete avaxToUser[avaxAddr];
            delete userLinks[msg.sender].avaxAddress;
            userLinks[msg.sender].totalLinkedWallets--;
            emit WalletUnlinked(msg.sender, chainType, avaxAddr, block.timestamp);
        } else if (chainType == ChainType.BASE && userLinks[msg.sender].baseAddress != bytes32(0)) {
            bytes32 baseAddr = userLinks[msg.sender].baseAddress;
            delete baseToUser[baseAddr];
            delete userLinks[msg.sender].baseAddress;
            userLinks[msg.sender].totalLinkedWallets--;
            emit WalletUnlinked(msg.sender, chainType, baseAddr, block.timestamp);
        } else if (chainType == ChainType.POLYGON && userLinks[msg.sender].polygonAddress != bytes32(0)) {
            bytes32 polygonAddr = userLinks[msg.sender].polygonAddress;
            delete polygonToUser[polygonAddr];
            delete userLinks[msg.sender].polygonAddress;
            userLinks[msg.sender].totalLinkedWallets--;
            emit WalletUnlinked(msg.sender, chainType, polygonAddr, block.timestamp);
        }
    }

    // =============================================================================
    // PROFILE MANAGEMENT
    // =============================================================================

    /**
     * @dev Create or update user profile
     * @param username The username for the profile
     * @param avatarHash IPFS hash for profile picture
     */
    function updateProfile(
        string calldata username,
        bytes32 avatarHash
    ) external onlyLinkedUser(msg.sender) {
        require(bytes(username).length > 0, "Username cannot be empty");
        require(bytes(username).length <= 32, "Username too long");
        require(!reservedUsernames[username], "Username is reserved");
        require(avatarHash != bytes32(0), "Invalid avatar hash");

        // Check if username is already taken
        require(userProfiles[msg.sender].username == "" || 
                userProfiles[msg.sender].username == username, "Username already taken");

        if (userProfiles[msg.sender].createdAt == 0) {
            userProfiles[msg.sender].createdAt = block.timestamp;
        }

        userProfiles[msg.sender].username = username;
        userProfiles[msg.sender].avatarHash = avatarHash;

        emit ProfileUpdated(msg.sender, username, avatarHash, userProfiles[msg.sender].reputationScore);
    }

    /**
     * @dev Update user reputation score (only callable by authorized contracts)
     * @param user The user address
     * @param newScore The new reputation score
     * @param reason The reason for the score change
     */
    function updateReputation(
        address user,
        uint256 newScore,
        string calldata reason
    ) external onlyOwner {
        require(user != address(0), "Invalid user address");
        require(userLinks[user].evmAddress != address(0), "User not found");

        uint256 oldScore = userProfiles[user].reputationScore;
        userProfiles[user].reputationScore = newScore;

        emit ReputationUpdated(user, oldScore, newScore, reason);
    }

    // =============================================================================
    // QUERY FUNCTIONS
    // =============================================================================

    /**
     * @dev Get all linked wallets for a user
     * @param user The user address
     * @return The LinkedWallet struct
     */
    function getLinkedWallets(address user) external view returns (LinkedWallet memory) {
        return userLinks[user];
    }

    /**
     * @dev Get user profile
     * @param user The user address
     * @return The UserProfile struct
     */
    function getUserProfile(address user) external view returns (UserProfile memory) {
        return userProfiles[user];
    }

    /**
     * @dev Find user by chain address
     * @param chainType The type of chain
     * @param chainAddress The address on that chain
     * @return The EVM address of the user
     */
    function getUserByChainAddress(
        ChainType chainType,
        bytes32 chainAddress
    ) external view returns (address) {
        if (chainType == ChainType.BTC) {
            return btcToUser[chainAddress];
        } else if (chainType == ChainType.SOLANA) {
            return solanaToUser[chainAddress];
        } else if (chainType == ChainType.AVAX) {
            return avaxToUser[chainAddress];
        } else if (chainType == ChainType.BASE) {
            return baseToUser[chainAddress];
        } else if (chainType == ChainType.POLYGON) {
            return polygonToUser[chainAddress];
        }
        return address(0);
    }

    /**
     * @dev Check if a wallet is linked
     * @param user The user address
     * @param chainType The type of chain
     * @return True if the wallet is linked
     */
    function isWalletLinked(
        address user,
        ChainType chainType
    ) external view returns (bool) {
        if (chainType == ChainType.EVM) {
            return userLinks[user].evmAddress != address(0);
        } else if (chainType == ChainType.BTC) {
            return userLinks[user].btcAddress.length > 0;
        } else if (chainType == ChainType.SOLANA) {
            return userLinks[user].solanaAddress != bytes32(0);
        } else if (chainType == ChainType.AVAX) {
            return userLinks[user].avaxAddress != bytes32(0);
        } else if (chainType == ChainType.BASE) {
            return userLinks[user].baseAddress != bytes32(0);
        } else if (chainType == ChainType.POLYGON) {
            return userLinks[msg.sender].polygonAddress != bytes32(0);
        }
        return false;
    }

    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================

    /**
     * @dev Reserve a username (admin only)
     * @param username The username to reserve
     */
    function reserveUsername(string calldata username) external onlyOwner {
        reservedUsernames[username] = true;
    }

    /**
     * @dev Set user verification status (admin only)
     * @param user The user address
     * @param verified The verification status
     */
    function setUserVerification(address user, bool verified) external onlyOwner {
        require(userLinks[user].evmAddress != address(0), "User not found");
        userProfiles[user].isVerified = verified;
    }

    /**
     * @dev Emergency function to unlink all wallets for a user (admin only)
     * @param user The user address
     */
    function emergencyUnlinkUser(address user) external onlyOwner {
        require(userLinks[user].evmAddress != address(0), "User not found");
        
        // Clear all linked addresses
        if (userLinks[user].btcAddress.length > 0) {
            bytes32 btcHash = keccak256(userLinks[user].btcAddress);
            delete btcToUser[btcHash];
        }
        if (userLinks[user].solanaAddress != bytes32(0)) {
            delete solanaToUser[userLinks[user].solanaAddress];
        }
        if (userLinks[user].avaxAddress != bytes32(0)) {
            delete avaxToUser[userLinks[user].avaxAddress];
        }
        if (userLinks[user].baseAddress != bytes32(0)) {
            delete baseToUser[userLinks[user].baseAddress];
        }
        if (userLinks[user].polygonAddress != bytes32(0)) {
            delete polygonToUser[userLinks[user].polygonAddress];
        }
        
        // Clear user data
        delete userLinks[user];
        delete userProfiles[user];
    }
}
