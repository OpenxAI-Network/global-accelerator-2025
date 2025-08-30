// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title CrossChainPriceOracle
 * @dev Aggregates price data from multiple chains into a single median feed
 * @author Aegis AI Team
 */
contract CrossChainPriceOracle is Ownable, ReentrancyGuard, Pausable {
    using SafeMath for uint256;

    // =============================================================================
    // INTERFACES
    // =============================================================================

    interface IGateway {
        function sendCrossChainMessage(
            uint256 destChainId,
            bytes calldata payload
        ) external;
    }

    // =============================================================================
    // STRUCTS
    // =============================================================================

    struct PriceReport {
        uint256 price;
        uint256 timestamp;
        uint256 sourceChainId;
        address reporter;
        uint256 confidence; // 0-100 confidence score
        bool isValid;
    }

    struct AssetConfig {
        bool enabled;
        uint256 minReports; // Minimum reports needed for valid price
        uint256 maxAge; // Maximum age of price data
        uint256 priceDecimals;
        uint256[] supportedChains; // Chain IDs that can report prices
        mapping(uint256 => bool) isChainSupported; // Quick lookup for supported chains
    }

    struct ChainConfig {
        bool enabled;
        uint256 weight; // Weight for this chain's price (1-100)
        uint256 lastReport; // Last time this chain reported
        uint256 reportCount; // Total reports from this chain
        uint256 successRate; // Success rate of this chain's reports
    }

    // =============================================================================
    // STATE VARIABLES
    // =============================================================================

    IGateway public gateway;
    
    uint256 public constant MAX_CHAINS = 20;
    uint256 public constant MAX_ASSETS = 100;
    uint256 public constant PRICE_PRECISION = 1e18;
    uint256 public constant CONFIDENCE_THRESHOLD = 70; // Minimum confidence for valid price
    
    mapping(bytes32 => AssetConfig) public assetConfigs;
    mapping(uint256 => ChainConfig) public chainConfigs;
    mapping(bytes32 => PriceReport[]) public assetPriceReports;
    mapping(bytes32 => uint256) public latestMedianPrice;
    mapping(bytes32 => uint256) public latestPriceTimestamp;
    mapping(bytes32 => mapping(uint256 => uint256)) public lastReportFromChain;
    
    bytes32[] public supportedAssets;
    uint256[] public supportedChains;
    
    uint256 public totalAssets;
    uint256 public totalChains;
    uint256 public totalPriceUpdates;

    // =============================================================================
    // EVENTS
    // =============================================================================

    event PriceReportReceived(
        bytes32 indexed assetId,
        uint256 price,
        uint256 timestamp,
        uint256 sourceChainId,
        address reporter,
        uint256 confidence
    );

    event PriceUpdated(
        bytes32 indexed assetId,
        uint256 medianPrice,
        uint256 timestamp,
        uint256 reportCount
    );

    event AssetAdded(
        bytes32 indexed assetId,
        uint256 minReports,
        uint256 maxAge,
        uint256[] supportedChains
    );

    event ChainAdded(
        uint256 indexed chainId,
        uint256 weight,
        bool enabled
    );

    event PriceReportRejected(
        bytes32 indexed assetId,
        uint256 sourceChainId,
        string reason
    );

    event OracleConfigUpdated(
        bytes32 indexed assetId,
        uint256 minReports,
        uint256 maxAge
    );

    // =============================================================================
    // MODIFIERS
    // =============================================================================

    modifier onlyGateway() {
        require(msg.sender == address(gateway), "Only gateway can call this");
        _;
    }

    modifier onlyValidAsset(bytes32 assetId) {
        require(assetConfigs[assetId].enabled, "Asset not supported");
        _;
    }

    modifier onlyValidChain(uint256 chainId) {
        require(chainConfigs[chainId].enabled, "Chain not supported");
        _;
    }

    modifier onlyValidPrice(uint256 price) {
        require(price > 0, "Price must be greater than 0");
        _;
    }

    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================

    constructor(address _gateway) {
        gateway = IGateway(_gateway);
        _initializeDefaultChains();
    }

    // =============================================================================
    // GATEWAY EVENT SUBSCRIPTION FUNCTIONS
    // =============================================================================

    /**
     * @dev Gateway subscription hook - called by ZetaChain on price report from any chain
     * @param assetId The asset identifier
     * @param price The reported price
     * @param sourceChainId The chain ID where the price originated
     * @param reporter The address that reported the price
     * @param confidence The confidence score (0-100)
     */
    function onChainPriceReport(
        bytes32 assetId,
        uint256 price,
        uint256 sourceChainId,
        address reporter,
        uint256 confidence
    ) external onlyGateway {
        require(assetId != bytes32(0), "Invalid asset ID");
        require(reporter != address(0), "Invalid reporter address");
        require(confidence <= 100, "Invalid confidence score");
        
        // Validate the price report
        if (!_validatePriceReport(assetId, price, sourceChainId, confidence)) {
            emit PriceReportRejected(assetId, sourceChainId, "Validation failed");
            return;
        }
        
        // Add the price report
        _addPriceReport(assetId, price, sourceChainId, reporter, confidence);
        
        // Check if we have enough reports to calculate median
        if (_canCalculateMedian(assetId)) {
            uint256 medianPrice = _calculateMedianPrice(assetId);
            _updateMedianPrice(assetId, medianPrice);
        }
    }

    /**
     * @dev Gateway subscription hook - called by ZetaChain on price feed request
     * @param assetId The asset identifier
     * @param requesterChainId The chain ID requesting the price
     * @param requester The address requesting the price
     */
    function onPriceFeedRequest(
        bytes32 assetId,
        uint256 requesterChainId,
        address requester
    ) external onlyGateway {
        require(assetId != bytes32(0), "Invalid asset ID");
        require(requester != address(0), "Invalid requester address");
        
        // Send current median price to the requesting chain
        uint256 currentPrice = latestMedianPrice[assetId];
        uint256 currentTimestamp = latestPriceTimestamp[assetId];
        
        if (currentPrice > 0 && currentTimestamp > 0) {
            bytes memory payload = abi.encode(
                "priceFeed",
                assetId,
                currentPrice,
                currentTimestamp,
                requester
            );
            
            gateway.sendCrossChainMessage(requesterChainId, payload);
        }
    }

    // =============================================================================
    // PRICE REPORT MANAGEMENT
    // =============================================================================

    /**
     * @dev Add a new price report to the system
     * @param assetId The asset identifier
     * @param price The reported price
     * @param sourceChainId The chain ID where the price originated
     * @param reporter The address that reported the price
     * @param confidence The confidence score
     */
    function _addPriceReport(
        bytes32 assetId,
        uint256 price,
        uint256 sourceChainId,
        address reporter,
        uint256 confidence
    ) internal {
        PriceReport memory report = PriceReport({
            price: price,
            timestamp: block.timestamp,
            sourceChainId: sourceChainId,
            reporter: reporter,
            confidence: confidence,
            isValid: true
        });
        
        assetPriceReports[assetId].push(report);
        lastReportFromChain[assetId][sourceChainId] = block.timestamp;
        
        // Update chain statistics
        ChainConfig storage chainConfig = chainConfigs[sourceChainId];
        chainConfig.lastReport = block.timestamp;
        chainConfig.reportCount = chainConfig.reportCount.add(1);
        
        totalPriceUpdates = totalPriceUpdates.add(1);
        
        emit PriceReportReceived(
            assetId,
            price,
            block.timestamp,
            sourceChainId,
            reporter,
            confidence
        );
    }

    /**
     * @dev Validate a price report
     * @param assetId The asset identifier
     * @param price The reported price
     * @param sourceChainId The chain ID where the price originated
     * @param confidence The confidence score
     * @return True if the report is valid
     */
    function _validatePriceReport(
        bytes32 assetId,
        uint256 price,
        uint256 sourceChainId,
        uint256 confidence
    ) internal view returns (bool) {
        // Check if asset is supported
        if (!assetConfigs[assetId].enabled) {
            return false;
        }
        
        // Check if chain is supported for this asset
        if (!assetConfigs[assetId].isChainSupported[sourceChainId]) {
            return false;
        }
        
        // Check if chain is enabled
        if (!chainConfigs[sourceChainId].enabled) {
            return false;
        }
        
        // Check confidence threshold
        if (confidence < CONFIDENCE_THRESHOLD) {
            return false;
        }
        
        // Check if price is within reasonable bounds
        uint256 currentMedian = latestMedianPrice[assetId];
        if (currentMedian > 0) {
            uint256 deviation = _calculateDeviation(price, currentMedian);
            if (deviation > 50) { // More than 50% deviation
                return false;
            }
        }
        
        return true;
    }

    /**
     * @dev Check if we can calculate median for an asset
     * @param assetId The asset identifier
     * @return True if we can calculate median
     */
    function _canCalculateMedian(bytes32 assetId) internal view returns (bool) {
        AssetConfig storage config = assetConfigs[assetId];
        PriceReport[] storage reports = assetPriceReports[assetId];
        
        if (reports.length < config.minReports) {
            return false;
        }
        
        // Check if we have recent reports from different chains
        uint256 recentReports = 0;
        uint256 cutoffTime = block.timestamp.sub(config.maxAge);
        
        for (uint256 i = 0; i < reports.length; i++) {
            if (reports[i].timestamp >= cutoffTime && reports[i].isValid) {
                recentReports = recentReports.add(1);
            }
        }
        
        return recentReports >= config.minReports;
    }

    /**
     * @dev Calculate median price for an asset
     * @param assetId The asset identifier
     * @return The median price
     */
    function _calculateMedianPrice(bytes32 assetId) internal view returns (uint256) {
        PriceReport[] storage reports = assetPriceReports[assetId];
        AssetConfig storage config = assetConfigs[assetId];
        
        // Filter recent, valid reports
        uint256[] memory validPrices = new uint256[](reports.length);
        uint256 validCount = 0;
        uint256 cutoffTime = block.timestamp.sub(config.maxAge);
        
        for (uint256 i = 0; i < reports.length; i++) {
            if (reports[i].timestamp >= cutoffTime && reports[i].isValid) {
                validPrices[validCount] = reports[i].price;
                validCount = validCount.add(1);
            }
        }
        
        if (validCount == 0) {
            return 0;
        }
        
        // Sort prices (simple bubble sort for small arrays)
        for (uint256 i = 0; i < validCount; i++) {
            for (uint256 j = i.add(1); j < validCount; j++) {
                if (validPrices[j] < validPrices[i]) {
                    uint256 temp = validPrices[i];
                    validPrices[i] = validPrices[j];
                    validPrices[j] = temp;
                }
            }
        }
        
        // Return median
        if (validCount % 2 == 0) {
            // Even number of elements - average of two middle values
            uint256 mid1 = validPrices[validCount.div(2).sub(1)];
            uint256 mid2 = validPrices[validCount.div(2)];
            return mid1.add(mid2).div(2);
        } else {
            // Odd number of elements - middle value
            return validPrices[validCount.div(2)];
        }
    }

    /**
     * @dev Update median price for an asset
     * @param assetId The asset identifier
     * @param medianPrice The new median price
     */
    function _updateMedianPrice(bytes32 assetId, uint256 medianPrice) internal {
        latestMedianPrice[assetId] = medianPrice;
        latestPriceTimestamp[assetId] = block.timestamp;
        
        emit PriceUpdated(
            assetId,
            medianPrice,
            block.timestamp,
            assetPriceReports[assetId].length
        );
    }

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    /**
     * @dev Calculate percentage deviation between two prices
     * @param price1 First price
     * @param price2 Second price
     * @return The percentage deviation
     */
    function _calculateDeviation(uint256 price1, uint256 price2) internal pure returns (uint256) {
        if (price2 == 0) return 0;
        
        uint256 difference = price1 > price2 ? price1.sub(price2) : price2.sub(price1);
        return difference.mul(100).div(price2);
    }

    /**
     * @dev Get weighted average price from multiple chains
     * @param assetId The asset identifier
     * @return The weighted average price
     */
    function getWeightedAveragePrice(bytes32 assetId) external view returns (uint256) {
        require(assetConfigs[assetId].enabled, "Asset not supported");
        
        PriceReport[] storage reports = assetPriceReports[assetId];
        uint256 totalWeight = 0;
        uint256 weightedSum = 0;
        uint256 cutoffTime = block.timestamp.sub(assetConfigs[assetId].maxAge);
        
        for (uint256 i = 0; i < reports.length; i++) {
            if (reports[i].timestamp >= cutoffTime && reports[i].isValid) {
                uint256 chainWeight = chainConfigs[reports[i].sourceChainId].weight;
                totalWeight = totalWeight.add(chainWeight);
                weightedSum = weightedSum.add(reports[i].price.mul(chainWeight));
            }
        }
        
        if (totalWeight == 0) return 0;
        return weightedSum.div(totalWeight);
    }

    /**
     * @dev Get price reports for an asset
     * @param assetId The asset identifier
     * @return Array of price reports
     */
    function getPriceReports(bytes32 assetId) external view returns (PriceReport[] memory) {
        return assetPriceReports[assetId];
    }

    /**
     * @dev Get latest price for an asset
     * @param assetId The asset identifier
     * @return The latest price and timestamp
     */
    function getLatestPrice(bytes32 assetId) external view returns (uint256 price, uint256 timestamp) {
        return (latestMedianPrice[assetId], latestPriceTimestamp[assetId]);
    }

    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================

    /**
     * @dev Add a new supported asset
     * @param assetId The asset identifier
     * @param minReports Minimum reports needed for valid price
     * @param maxAge Maximum age of price data
     * @param priceDecimals Price decimal places
     * @param supportedChains Array of supported chain IDs
     */
    function addAsset(
        bytes32 assetId,
        uint256 minReports,
        uint256 maxAge,
        uint256 priceDecimals,
        uint256[] memory supportedChains
    ) external onlyOwner {
        require(assetId != bytes32(0), "Invalid asset ID");
        require(minReports > 0, "Min reports must be greater than 0");
        require(maxAge > 0, "Max age must be greater than 0");
        require(supportedChains.length <= MAX_CHAINS, "Too many supported chains");
        require(!assetConfigs[assetId].enabled, "Asset already exists");
        
        AssetConfig storage config = assetConfigs[assetId];
        config.enabled = true;
        config.minReports = minReports;
        config.maxAge = maxAge;
        config.priceDecimals = priceDecimals;
        config.supportedChains = supportedChains;
        
        // Mark supported chains
        for (uint256 i = 0; i < supportedChains.length; i++) {
            config.isChainSupported[supportedChains[i]] = true;
        }
        
        supportedAssets.push(assetId);
        totalAssets = totalAssets.add(1);
        
        emit AssetAdded(assetId, minReports, maxAge, supportedChains);
    }

    /**
     * @dev Add a new supported chain
     * @param chainId The chain ID
     * @param weight The weight for this chain's prices
     * @param enabled Whether the chain is enabled
     */
    function addChain(
        uint256 chainId,
        uint256 weight,
        bool enabled
    ) external onlyOwner {
        require(chainId > 0, "Invalid chain ID");
        require(weight > 0 && weight <= 100, "Invalid weight");
        require(!chainConfigs[chainId].enabled, "Chain already exists");
        
        ChainConfig storage config = chainConfigs[chainId];
        config.enabled = enabled;
        config.weight = weight;
        config.lastReport = 0;
        config.reportCount = 0;
        config.successRate = 100; // Start with 100% success rate
        
        supportedChains.push(chainId);
        totalChains = totalChains.add(1);
        
        emit ChainAdded(chainId, weight, enabled);
    }

    /**
     * @dev Update asset configuration
     * @param assetId The asset identifier
     * @param minReports New minimum reports
     * @param maxAge New maximum age
     */
    function updateAssetConfig(
        bytes32 assetId,
        uint256 minReports,
        uint256 maxAge
    ) external onlyOwner onlyValidAsset(assetId) {
        require(minReports > 0, "Min reports must be greater than 0");
        require(maxAge > 0, "Max age must be greater than 0");
        
        AssetConfig storage config = assetConfigs[assetId];
        config.minReports = minReports;
        config.maxAge = maxAge;
        
        emit OracleConfigUpdated(assetId, minReports, maxAge);
    }

    /**
     * @dev Update chain configuration
     * @param chainId The chain ID
     * @param weight New weight
     * @param enabled Whether the chain is enabled
     */
    function updateChainConfig(
        uint256 chainId,
        uint256 weight,
        bool enabled
    ) external onlyOwner onlyValidChain(chainId) {
        require(weight > 0 && weight <= 100, "Invalid weight");
        
        ChainConfig storage config = chainConfigs[chainId];
        config.weight = weight;
        config.enabled = enabled;
    }

    /**
     * @dev Update gateway address
     * @param _gateway The new gateway address
     */
    function updateGateway(address _gateway) external onlyOwner {
        require(_gateway != address(0), "Invalid gateway address");
        gateway = IGateway(_gateway);
    }

    /**
     * @dev Pause the oracle
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the oracle
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // =============================================================================
    // INITIALIZATION
    // =============================================================================

    /**
     * @dev Initialize default supported chains
     */
    function _initializeDefaultChains() internal {
        // Ethereum Mainnet
        _addDefaultChain(1, 100, true);
        // BSC
        _addDefaultChain(56, 80, true);
        // Polygon
        _addDefaultChain(137, 75, true);
        // Avalanche
        _addDefaultChain(43114, 70, true);
        // Base
        _addDefaultChain(8453, 65, true);
        // ZetaChain
        _addDefaultChain(7000, 90, true);
    }

    /**
     * @dev Add a default chain configuration
     * @param chainId The chain ID
     * @param weight The weight
     * @param enabled Whether enabled
     */
    function _addDefaultChain(uint256 chainId, uint256 weight, bool enabled) internal {
        ChainConfig storage config = chainConfigs[chainId];
        config.enabled = enabled;
        config.weight = weight;
        config.lastReport = 0;
        config.reportCount = 0;
        config.successRate = 100;
        
        supportedChains.push(chainId);
        totalChains = totalChains.add(1);
    }
}
