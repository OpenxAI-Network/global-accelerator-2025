// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "@zetachain/protocol-contracts/contracts/zevm/SystemContract.sol";
import "@zetachain/protocol-contracts/contracts/zevm/interfaces/IZRC20.sol";
import "@zetachain/protocol-contracts/contracts/zevm/UniversalContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AegisInheritance
 * @dev Secure multi-chain asset distribution on death verification
 * @notice Uses ZetaChain's Universal Contract pattern for cross-chain operations
 */
contract AegisInheritance is UniversalContract, Ownable, ReentrancyGuard {
    using SafeMath for uint256;

    // ========== STRUCTS ==========
    
    struct Beneficiary {
        uint256 chainId;
        address wallet;
        uint256 percentage;
        bool active;
    }
    
    struct Asset {
        uint256 chainId;
        address token;
        uint256 amount;
        uint256 beneficiaryIndex;
        bool distributed;
    }
    
    struct DeathCertificate {
        bytes32 hash;
        uint256 timestamp;
        bool verified;
        address verifier;
    }
    
    struct InheritancePlan {
        address owner;
        Beneficiary[] beneficiaries;
        Asset[] assets;
        DeathCertificate deathCert;
        bool active;
        uint256 createdAt;
        uint256 lastModified;
    }

    // ========== STATE VARIABLES ==========
    
    SystemContract public immutable systemContract;
    
    // Mapping from owner to inheritance plan
    mapping(address => InheritancePlan) public inheritancePlans;
    
    // Trusted oracles for death verification
    mapping(address => bool) public trustedOracles;
    
    // Events
    event InheritancePlanCreated(address indexed owner, uint256 beneficiaryCount, uint256 assetCount);
    event BeneficiaryAdded(address indexed owner, address indexed beneficiary, uint256 chainId, uint256 percentage);
    event AssetRegistered(address indexed owner, uint256 chainId, address token, uint256 amount);
    event DeathVerified(address indexed owner, bytes32 indexed certificateHash, uint256 timestamp);
    event AssetDistributed(address indexed owner, uint256 indexed assetIndex, uint256 amount, uint256 targetChain);
    event InheritanceCompleted(address indexed owner, uint256 totalAssetsDistributed);

    // ========== MODIFIERS ==========
    
    modifier onlyOracle() {
        require(trustedOracles[msg.sender], "Aegis: Only trusted oracle");
        _;
    }
    
    modifier planExists(address owner) {
        require(inheritancePlans[owner].active, "Aegis: No active inheritance plan");
        _;
    }
    
    modifier onlyPlanOwner(address owner) {
        require(msg.sender == owner || msg.sender == owner(), "Aegis: Only plan owner or contract owner");
        _;
    }

    // ========== CONSTRUCTOR ==========
    
    constructor(address _systemContract) {
        systemContract = SystemContract(_systemContract);
        _transferOwnership(msg.sender);
    }

    // ========== PUBLIC FUNCTIONS ==========
    
    /**
     * @dev Create a new inheritance plan
     * @param initialBeneficiaries Array of initial beneficiaries
     * @param initialAssets Array of initial assets
     */
    function createInheritancePlan(
        Beneficiary[] calldata initialBeneficiaries,
        Asset[] calldata initialAssets
    ) external {
        require(!inheritancePlans[msg.sender].active, "Aegis: Plan already exists");
        require(initialBeneficiaries.length > 0, "Aegis: Must have at least one beneficiary");
        require(initialAssets.length > 0, "Aegis: Must have at least one asset");
        
        InheritancePlan storage plan = inheritancePlans[msg.sender];
        plan.owner = msg.sender;
        plan.active = true;
        plan.createdAt = block.timestamp;
        plan.lastModified = block.timestamp;
        
        // Add beneficiaries
        for (uint i = 0; i < initialBeneficiaries.length; i++) {
            require(initialBeneficiaries[i].percentage > 0, "Aegis: Invalid percentage");
            plan.beneficiaries.push(initialBeneficiaries[i]);
        }
        
        // Add assets
        for (uint i = 0; i < initialAssets.length; i++) {
            require(initialAssets[i].beneficiaryIndex < initialBeneficiaries.length, "Aegis: Invalid beneficiary index");
            plan.assets.push(initialAssets[i]);
        }
        
        emit InheritancePlanCreated(msg.sender, initialBeneficiaries.length, initialAssets.length);
    }
    
    /**
     * @dev Add a new beneficiary to existing plan
     * @param beneficiary Beneficiary details
     */
    function addBeneficiary(Beneficiary calldata beneficiary) external planExists(msg.sender) {
        require(beneficiary.percentage > 0, "Aegis: Invalid percentage");
        
        InheritancePlan storage plan = inheritancePlans[msg.sender];
        plan.beneficiaries.push(beneficiary);
        plan.lastModified = block.timestamp;
        
        emit BeneficiaryAdded(msg.sender, beneficiary.wallet, beneficiary.chainId, beneficiary.percentage);
    }
    
    /**
     * @dev Register a new asset
     * @param asset Asset details
     */
    function registerAsset(Asset calldata asset) external planExists(msg.sender) {
        require(asset.beneficiaryIndex < inheritancePlans[msg.sender].beneficiaries.length, "Aegis: Invalid beneficiary index");
        
        InheritancePlan storage plan = inheritancePlans[msg.sender];
        plan.assets.push(asset);
        plan.lastModified = block.timestamp;
        
        emit AssetRegistered(msg.sender, asset.chainId, asset.token, asset.amount);
    }
    
    /**
     * @dev Verify death and trigger inheritance distribution
     * @param owner Address of the deceased
     * @param certificateHash Hash of the death certificate
     */
    function verifyDeath(address owner, bytes32 certificateHash) external onlyOracle planExists(owner) {
        InheritancePlan storage plan = inheritancePlans[owner];
        require(!plan.deathCert.verified, "Aegis: Death already verified");
        
        plan.deathCert = DeathCertificate({
            hash: certificateHash,
            timestamp: block.timestamp,
            verified: true,
            verifier: msg.sender
        });
        
        emit DeathVerified(owner, certificateHash, block.timestamp);
        
        // Start distribution process
        _distributeInheritance(owner);
    }
    
    /**
     * @dev Manual trigger for inheritance distribution (for testing)
     * @param owner Address of the deceased
     */
    function triggerDistribution(address owner) external onlyPlanOwner(owner) planExists(owner) {
        InheritancePlan storage plan = inheritancePlans[owner];
        require(plan.deathCert.verified, "Aegis: Death not verified");
        
        _distributeInheritance(owner);
    }

    // ========== INTERNAL FUNCTIONS ==========
    
    /**
     * @dev Distribute inheritance assets to beneficiaries
     * @param owner Address of the deceased
     */
    function _distributeInheritance(address owner) internal {
        InheritancePlan storage plan = inheritancePlans[owner];
        
        for (uint i = 0; i < plan.assets.length; i++) {
            if (!plan.assets[i].distributed) {
                _distributeAsset(owner, i);
            }
        }
        
        emit InheritanceCompleted(owner, plan.assets.length);
    }
    
    /**
     * @dev Distribute a specific asset to its beneficiary
     * @param owner Address of the deceased
     * @param assetIndex Index of the asset to distribute
     */
    function _distributeAsset(address owner, uint256 assetIndex) internal {
        InheritancePlan storage plan = inheritancePlans[owner];
        Asset storage asset = plan.assets[assetIndex];
        Beneficiary storage beneficiary = plan.beneficiaries[asset.beneficiaryIndex];
        
        require(!asset.distributed, "Aegis: Asset already distributed");
        
        // Mark as distributed
        asset.distributed = true;
        
        // Calculate distribution amount based on percentage
        uint256 distributionAmount = asset.amount.mul(beneficiary.percentage).div(100);
        
        // For now, we'll emit an event. In production, this would trigger cross-chain transfers
        emit AssetDistributed(owner, assetIndex, distributionAmount, beneficiary.chainId);
        
        // TODO: Implement cross-chain transfer logic using ZetaChain's messaging
        // This would involve:
        // 1. Sending message to source chain to transfer asset
        // 2. Converting to ZRC-20 on ZetaChain
        // 3. Transferring to beneficiary's chain
    }

    // ========== ADMIN FUNCTIONS ==========
    
    /**
     * @dev Add a trusted oracle
     * @param oracle Address of the oracle to trust
     */
    function addTrustedOracle(address oracle) external onlyOwner {
        trustedOracles[oracle] = true;
    }
    
    /**
     * @dev Remove a trusted oracle
     * @param oracle Address of the oracle to remove
     */
    function removeTrustedOracle(address oracle) external onlyOwner {
        trustedOracles[oracle] = false;
    }
    
    /**
     * @dev Emergency pause for security
     */
    function emergencyPause() external onlyOwner {
        // Implementation would pause all operations
    }

    // ========== VIEW FUNCTIONS ==========
    
    /**
     * @dev Get inheritance plan details
     * @param owner Address of the plan owner
     * @return plan The inheritance plan
     */
    function getInheritancePlan(address owner) external view returns (InheritancePlan memory plan) {
        return inheritancePlans[owner];
    }
    
    /**
     * @dev Get beneficiary count for a plan
     * @param owner Address of the plan owner
     * @return count Number of beneficiaries
     */
    function getBeneficiaryCount(address owner) external view returns (uint256 count) {
        return inheritancePlans[owner].beneficiaries.length;
    }
    
    /**
     * @dev Get asset count for a plan
     * @param owner Address of the plan owner
     * @return count Number of assets
     */
    function getAssetCount(address owner) external view returns (uint256 count) {
        return inheritancePlans[owner].assets.length;
    }
    
    /**
     * @dev Check if death has been verified for a plan
     * @param owner Address of the plan owner
     * @return verified Whether death has been verified
     */
    function isDeathVerified(address owner) external view returns (bool verified) {
        return inheritancePlans[owner].deathCert.verified;
    }

    // ========== UNIVERSAL CONTRACT FUNCTIONS ==========
    
    /**
     * @dev Handle cross-chain calls (implements UniversalContract interface)
     * @param origin Origin address
     * @param chainID Source chain ID
     * @param caller Caller address
     * @param value Value sent
     * @param message Cross-chain message
     */
    function onCrossChainCall(
        address origin,
        uint256 chainID,
        address caller,
        uint256 value,
        bytes calldata message
    ) external override {
        // This function would handle cross-chain messages for asset transfers
        // Implementation depends on specific ZetaChain integration requirements
    }
    
    /**
     * @dev Handle cross-chain call reversals
     * @param origin Origin address
     * @param chainID Source chain ID
     * @param caller Caller address
     * @param value Value sent
     * @param message Cross-chain message
     */
    function onRevert(
        address origin,
        uint256 chainID,
        address caller,
        uint256 value,
        bytes calldata message
    ) external override {
        // Handle failed cross-chain operations
        // Could implement retry logic or fallback mechanisms
    }
}

// SafeMath library for arithmetic operations
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