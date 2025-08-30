// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title SolanaIntegration
 * @dev Advanced Non-EVM Workflows for BTC → Solana → Avalanche coordination
 * @author Aegis AI Team
 */
contract SolanaIntegration is Ownable, ReentrancyGuard, Pausable {
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

    struct CrossChainFlow {
        uint256 flowId;
        address user;
        bytes32 btcAddress;
        bytes32 solanaAddress;
        uint256 avaxChainId;
        uint256 amount;
        FlowStatus status;
        uint256 createdAt;
        uint256 completedAt;
        bytes32[] transactionHashes;
        mapping(uint256 => FlowStep) steps;
    }

    struct FlowStep {
        uint256 stepNumber;
        string action;
        uint256 sourceChainId;
        uint256 destChainId;
        bytes payload;
        bool completed;
        uint256 completedAt;
        bytes32 transactionHash;
    }

    struct BTCTransaction {
        bytes32 txHash;
        bytes32 address;
        uint256 amount;
        uint256 blockHeight;
        uint256 timestamp;
        bool confirmed;
    }

    struct SolanaTransaction {
        bytes32 signature;
        bytes32 fromAddress;
        bytes32 toAddress;
        uint256 amount;
        uint256 slot;
        uint256 timestamp;
        bool confirmed;
    }

    enum FlowStatus {
        PENDING,
        BTC_CONFIRMED,
        SOLANA_PROCESSING,
        AVAX_PENDING,
        COMPLETED,
        FAILED,
        CANCELLED
    }

    enum ChainType {
        BTC,
        SOLANA,
        AVAX,
        ZETACHAIN
    }

    // =============================================================================
    // STATE VARIABLES
    // =============================================================================

    IGateway public gateway;
    
    uint256 public constant BTC_CHAIN_ID = 0;
    uint256 public constant SOLANA_CHAIN_ID = 2;
    uint256 public constant AVAX_CHAIN_ID = 43114;
    uint256 public constant ZETA_CHAIN_ID = 7000;
    
    uint256 public constant BTC_CONFIRMATION_BLOCKS = 6;
    uint256 public constant SOLANA_CONFIRMATION_SLOTS = 32;
    uint256 public constant FLOW_TIMEOUT = 3600; // 1 hour
    
    mapping(uint256 => CrossChainFlow) public flows;
    mapping(bytes32 => BTCTransaction) public btcTransactions;
    mapping(bytes32 => SolanaTransaction) public solanaTransactions;
    mapping(address => uint256[]) public userFlows;
    mapping(bytes32 => uint256) public btcAddressToFlow;
    mapping(bytes32 => uint256) public solanaAddressToFlow;
    
    uint256 public totalFlows;
    uint256 public successfulFlows;
    uint256 public failedFlows;
    uint256 public flowCounter;

    // =============================================================================
    // EVENTS
    // =============================================================================

    event FlowCreated(
        uint256 indexed flowId,
        address indexed user,
        bytes32 btcAddress,
        bytes32 solanaAddress,
        uint256 amount,
        uint256 timestamp
    );

    event FlowStepCompleted(
        uint256 indexed flowId,
        uint256 stepNumber,
        string action,
        uint256 sourceChainId,
        uint256 destChainId,
        bytes32 transactionHash
    );

    event FlowCompleted(
        uint256 indexed flowId,
        address indexed user,
        uint256 totalTime,
        uint256 timestamp
    );

    event FlowFailed(
        uint256 indexed flowId,
        address indexed user,
        string reason,
        uint256 timestamp
    );

    event BTCTransactionReceived(
        bytes32 indexed txHash,
        bytes32 indexed address,
        uint256 amount,
        uint256 blockHeight
    );

    event SolanaTransactionReceived(
        bytes32 indexed signature,
        bytes32 indexed fromAddress,
        bytes32 indexed toAddress,
        uint256 amount
    );

    event CrossChainMessageSent(
        uint256 indexed destChainId,
        bytes payload,
        uint256 flowId
    );

    // =============================================================================
    // MODIFIERS
    // =============================================================================

    modifier onlyGateway() {
        require(msg.sender == address(gateway), "Only gateway can call this");
        _;
    }

    modifier onlyValidFlow(uint256 flowId) {
        require(flows[flowId].flowId != 0, "Flow does not exist");
        _;
    }

    modifier onlyFlowOwner(uint256 flowId) {
        require(flows[flowId].user == msg.sender, "Not flow owner");
        _;
    }

    // =============================================================================
    // CONSTRUCTOR
    // =============================================================================

    constructor(address _gateway) {
        gateway = IGateway(_gateway);
    }

    // =============================================================================
    // GATEWAY EVENT SUBSCRIPTION FUNCTIONS
    // =============================================================================

    /**
     * @dev Gateway subscription hook - called by ZetaChain on BTC transaction event
     * @param txHash The BTC transaction hash
     * @param address The BTC address
     * @param amount The transaction amount
     * @param blockHeight The block height
     */
    function onBTCTransaction(
        bytes32 txHash,
        bytes32 address,
        uint256 amount,
        uint256 blockHeight
    ) external onlyGateway {
        require(txHash != bytes32(0), "Invalid transaction hash");
        require(address != bytes32(0), "Invalid BTC address");
        require(amount > 0, "Invalid amount");
        
        // Check if this BTC address is part of an active flow
        uint256 flowId = btcAddressToFlow[address];
        if (flowId > 0 && flows[flowId].status == FlowStatus.PENDING) {
            _processBTCTransaction(flowId, txHash, address, amount, blockHeight);
        }
        
        // Store BTC transaction
        btcTransactions[txHash] = BTCTransaction({
            txHash: txHash,
            address: address,
            amount: amount,
            blockHeight: blockHeight,
            timestamp: block.timestamp,
            confirmed: false
        });
        
        emit BTCTransactionReceived(txHash, address, amount, blockHeight);
    }

    /**
     * @dev Gateway subscription hook - called by ZetaChain on Solana transaction event
     * @param signature The Solana transaction signature
     * @param fromAddress The sender address
     * @param toAddress The recipient address
     * @param amount The transaction amount
     * @param slot The Solana slot
     */
    function onSolanaTransaction(
        bytes32 signature,
        bytes32 fromAddress,
        bytes32 toAddress,
        uint256 amount,
        uint256 slot
    ) external onlyGateway {
        require(signature != bytes32(0), "Invalid signature");
        require(fromAddress != bytes32(0), "Invalid from address");
        require(toAddress != bytes32(0), "Invalid to address");
        require(amount > 0, "Invalid amount");
        
        // Check if this Solana address is part of an active flow
        uint256 flowId = solanaAddressToFlow[toAddress];
        if (flowId > 0 && flows[flowId].status == FlowStatus.SOLANA_PROCESSING) {
            _processSolanaTransaction(flowId, signature, fromAddress, toAddress, amount, slot);
        }
        
        // Store Solana transaction
        solanaTransactions[signature] = SolanaTransaction({
            signature: signature,
            fromAddress: fromAddress,
            toAddress: toAddress,
            amount: amount,
            slot: slot,
            timestamp: block.timestamp,
            confirmed: false
        });
        
        emit SolanaTransactionReceived(signature, fromAddress, toAddress, amount);
    }

    /**
     * @dev Gateway subscription hook - called by ZetaChain on flow completion event
     * @param flowId The flow ID
     * @param status The completion status
     * @param transactionHash The completion transaction hash
     */
    function onFlowCompletion(
        uint256 flowId,
        uint256 status,
        bytes32 transactionHash
    ) external onlyGateway onlyValidFlow(flowId) {
        require(status == uint256(FlowStatus.COMPLETED), "Invalid completion status");
        
        CrossChainFlow storage flow = flows[flowId];
        flow.status = FlowStatus.COMPLETED;
        flow.completedAt = block.timestamp;
        flow.transactionHashes.push(transactionHash);
        
        // Mark final step as completed
        flow.steps[4] = FlowStep({
            stepNumber: 4,
            action: "AVAX_CREDIT",
            sourceChainId: ZETA_CHAIN_ID,
            destChainId: AVAX_CHAIN_ID,
            payload: "",
            completed: true,
            completedAt: block.timestamp,
            transactionHash: transactionHash
        });
        
        successfulFlows = successfulFlows.add(1);
        
        emit FlowCompleted(flowId, flow.user, block.timestamp.sub(flow.createdAt), block.timestamp);
    }

    // =============================================================================
    // FLOW MANAGEMENT FUNCTIONS
    // =============================================================================

    /**
     * @dev Create a new cross-chain flow
     * @param btcAddress The BTC address for deposit
     * @param solanaAddress The Solana address for processing
     * @param avaxChainId The Avalanche chain ID for final destination
     * @param amount The amount to process
     */
    function createCrossChainFlow(
        bytes32 btcAddress,
        bytes32 solanaAddress,
        uint256 avaxChainId,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(btcAddress != bytes32(0), "Invalid BTC address");
        require(solanaAddress != bytes32(0), "Invalid Solana address");
        require(avaxChainId > 0, "Invalid Avalanche chain ID");
        require(amount > 0, "Invalid amount");
        
        flowCounter = flowCounter.add(1);
        
        CrossChainFlow storage flow = flows[flowCounter];
        flow.flowId = flowCounter;
        flow.user = msg.sender;
        flow.btcAddress = btcAddress;
        flow.solanaAddress = solanaAddress;
        flow.avaxChainId = avaxChainId;
        flow.amount = amount;
        flow.status = FlowStatus.PENDING;
        flow.createdAt = block.timestamp;
        
        // Initialize flow steps
        _initializeFlowSteps(flow);
        
        // Link addresses to flow
        btcAddressToFlow[btcAddress] = flowCounter;
        solanaAddressToFlow[solanaAddress] = flowCounter;
        
        userFlows[msg.sender].push(flowCounter);
        totalFlows = totalFlows.add(1);
        
        emit FlowCreated(flowCounter, msg.sender, btcAddress, solanaAddress, amount, block.timestamp);
        
        // Subscribe to BTC address monitoring
        _subscribeToBTCAddress(btcAddress);
    }

    /**
     * @dev Initialize flow steps for the cross-chain workflow
     * @param flow The flow to initialize
     */
    function _initializeFlowSteps(CrossChainFlow storage flow) internal {
        // Step 1: BTC Deposit Detection
        flow.steps[1] = FlowStep({
            stepNumber: 1,
            action: "BTC_DEPOSIT_DETECTED",
            sourceChainId: BTC_CHAIN_ID,
            destChainId: ZETA_CHAIN_ID,
            payload: "",
            completed: false,
            completedAt: 0,
            transactionHash: bytes32(0)
        });
        
        // Step 2: Solana Token Mint
        flow.steps[2] = FlowStep({
            stepNumber: 2,
            action: "SOLANA_TOKEN_MINT",
            sourceChainId: ZETA_CHAIN_ID,
            destChainId: SOLANA_CHAIN_ID,
            payload: "",
            completed: false,
            completedAt: 0,
            transactionHash: bytes32(0)
        });
        
        // Step 3: Avalanche Liquidity Pool Credit
        flow.steps[3] = FlowStep({
            stepNumber: 3,
            action: "AVAX_LIQUIDITY_CREDIT",
            sourceChainId: SOLANA_CHAIN_ID,
            destChainId: AVAX_CHAIN_ID,
            payload: "",
            completed: false,
            completedAt: 0,
            transactionHash: bytes32(0)
        });
    }

    /**
     * @dev Process BTC transaction and advance flow
     * @param flowId The flow ID
     * @param txHash The transaction hash
     * @param address The BTC address
     * @param amount The amount
     * @param blockHeight The block height
     */
    function _processBTCTransaction(
        uint256 flowId,
        bytes32 txHash,
        bytes32 address,
        uint256 amount,
        uint256 blockHeight
    ) internal {
        CrossChainFlow storage flow = flows[flowId];
        
        // Mark step 1 as completed
        flow.steps[1].completed = true;
        flow.steps[1].completedAt = block.timestamp;
        flow.steps[1].transactionHash = txHash;
        flow.transactionHashes.push(txHash);
        
        // Update flow status
        flow.status = FlowStatus.BTC_CONFIRMED;
        
        emit FlowStepCompleted(flowId, 1, "BTC_DEPOSIT_DETECTED", BTC_CHAIN_ID, ZETA_CHAIN_ID, txHash);
        
        // Trigger Solana token mint
        _triggerSolanaTokenMint(flowId);
    }

    /**
     * @dev Trigger Solana token mint after BTC confirmation
     * @param flowId The flow ID
     */
    function _triggerSolanaTokenMint(uint256 flowId) internal {
        CrossChainFlow storage flow = flows[flowId];
        
        // Prepare payload for Solana
        bytes memory payload = abi.encode(
            "mintToken",
            flow.solanaAddress,
            flow.amount,
            flow.flowId
        );
        
        // Send message to Solana
        gateway.sendCrossChainMessage(SOLANA_CHAIN_ID, payload);
        
        emit CrossChainMessageSent(SOLANA_CHAIN_ID, payload, flowId);
        
        // Update flow status
        flow.status = FlowStatus.SOLANA_PROCESSING;
    }

    /**
     * @dev Process Solana transaction and advance flow
     * @param flowId The flow ID
     * @param signature The transaction signature
     * @param fromAddress The sender address
     * @param toAddress The recipient address
     * @param amount The amount
     * @param slot The Solana slot
     */
    function _processSolanaTransaction(
        uint256 flowId,
        bytes32 signature,
        bytes32 fromAddress,
        bytes32 toAddress,
        uint256 amount,
        uint256 slot
    ) internal {
        CrossChainFlow storage flow = flows[flowId];
        
        // Mark step 2 as completed
        flow.steps[2].completed = true;
        flow.steps[2].completedAt = block.timestamp;
        flow.steps[2].transactionHash = signature;
        flow.transactionHashes.push(signature);
        
        emit FlowStepCompleted(flowId, 2, "SOLANA_TOKEN_MINT", ZETA_CHAIN_ID, SOLANA_CHAIN_ID, signature);
        
        // Trigger Avalanche liquidity pool credit
        _triggerAvalancheCredit(flowId);
    }

    /**
     * @dev Trigger Avalanche liquidity pool credit after Solana processing
     * @param flowId The flow ID
     */
    function _triggerAvalancheCredit(uint256 flowId) internal {
        CrossChainFlow storage flow = flows[flowId];
        
        // Prepare payload for Avalanche
        bytes memory payload = abi.encode(
            "creditLiquidityPool",
            flow.amount,
            flow.flowId,
            flow.user
        );
        
        // Send message to Avalanche
        gateway.sendCrossChainMessage(flow.avaxChainId, payload);
        
        emit CrossChainMessageSent(flow.avaxChainId, payload, flowId);
    }

    // =============================================================================
    // SUBSCRIPTION FUNCTIONS
    // =============================================================================

    /**
     * @dev Subscribe to BTC address monitoring
     * @param btcAddress The BTC address to monitor
     */
    function _subscribeToBTCAddress(bytes32 btcAddress) internal {
        // In production, this would register with ZetaChain's BTC monitoring system
        // For now, we'll emit an event to indicate subscription
        bytes memory payload = abi.encode("subscribe", btcAddress, address(this));
        gateway.sendCrossChainMessage(BTC_CHAIN_ID, payload);
    }

    /**
     * @dev Subscribe to Solana address monitoring
     * @param solanaAddress The Solana address to monitor
     */
    function _subscribeToSolanaAddress(bytes32 solanaAddress) internal {
        // In production, this would register with ZetaChain's Solana monitoring system
        bytes memory payload = abi.encode("subscribe", solanaAddress, address(this));
        gateway.sendCrossChainMessage(SOLANA_CHAIN_ID, payload);
    }

    // =============================================================================
    // FLOW QUERY FUNCTIONS
    // =============================================================================

    /**
     * @dev Get flow information
     * @param flowId The flow ID
     * @return The flow information
     */
    function getFlow(uint256 flowId) external view returns (
        uint256 flowId_,
        address user,
        bytes32 btcAddress,
        bytes32 solanaAddress,
        uint256 avaxChainId,
        uint256 amount,
        FlowStatus status,
        uint256 createdAt,
        uint256 completedAt
    ) {
        CrossChainFlow storage flow = flows[flowId];
        return (
            flow.flowId,
            flow.user,
            flow.btcAddress,
            flow.solanaAddress,
            flow.avaxChainId,
            flow.amount,
            flow.status,
            flow.createdAt,
            flow.completedAt
        );
    }

    /**
     * @dev Get flow step information
     * @param flowId The flow ID
     * @param stepNumber The step number
     * @return The step information
     */
    function getFlowStep(uint256 flowId, uint256 stepNumber) external view returns (
        uint256 stepNumber_,
        string memory action,
        uint256 sourceChainId,
        uint256 destChainId,
        bool completed,
        uint256 completedAt,
        bytes32 transactionHash
    ) {
        CrossChainFlow storage flow = flows[flowId];
        FlowStep storage step = flow.steps[stepNumber];
        return (
            step.stepNumber,
            step.action,
            step.sourceChainId,
            step.destChainId,
            step.completed,
            step.completedAt,
            step.transactionHash
        );
    }

    /**
     * @dev Get user flows
     * @param user The user address
     * @return Array of flow IDs
     */
    function getUserFlows(address user) external view returns (uint256[] memory) {
        return userFlows[user];
    }

    /**
     * @dev Get flow transaction hashes
     * @param flowId The flow ID
     * @return Array of transaction hashes
     */
    function getFlowTransactions(uint256 flowId) external view returns (bytes32[] memory) {
        return flows[flowId].transactionHashes;
    }

    // =============================================================================
    // ADMIN FUNCTIONS
    // =============================================================================

    /**
     * @dev Cancel a flow (admin only)
     * @param flowId The flow ID to cancel
     */
    function cancelFlow(uint256 flowId) external onlyOwner onlyValidFlow(flowId) {
        CrossChainFlow storage flow = flows[flowId];
        require(flow.status != FlowStatus.COMPLETED, "Flow already completed");
        
        flow.status = FlowStatus.CANCELLED;
        failedFlows = failedFlows.add(1);
        
        emit FlowFailed(flowId, flow.user, "Cancelled by admin", block.timestamp);
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
     * @dev Pause the contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // =============================================================================
    // UTILITY FUNCTIONS
    // =============================================================================

    /**
     * @dev Get flow statistics
     * @return Total flows, successful flows, failed flows
     */
    function getFlowStatistics() external view returns (
        uint256 total,
        uint256 successful,
        uint256 failed
    ) {
        return (totalFlows, successfulFlows, failedFlows);
    }

    /**
     * @dev Check if a flow is active
     * @param flowId The flow ID
     * @return True if the flow is active
     */
    function isFlowActive(uint256 flowId) external view returns (bool) {
        CrossChainFlow storage flow = flows[flowId];
        return flow.status != FlowStatus.COMPLETED && 
               flow.status != FlowStatus.FAILED && 
               flow.status != FlowStatus.CANCELLED;
    }

    /**
     * @dev Get flow progress percentage
     * @param flowId The flow ID
     * @return The progress percentage (0-100)
     */
    function getFlowProgress(uint256 flowId) external view returns (uint256) {
        CrossChainFlow storage flow = flows[flowId];
        uint256 completedSteps = 0;
        
        for (uint256 i = 1; i <= 4; i++) {
            if (flow.steps[i].completed) {
                completedSteps = completedSteps.add(1);
            }
        }
        
        return completedSteps.mul(25); // 4 steps = 100%
    }
}
