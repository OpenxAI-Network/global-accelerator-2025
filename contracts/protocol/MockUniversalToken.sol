// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../interfaces/IUniversalToken.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUniversalToken
 * @dev Mock implementation of Universal Token for testing purposes
 * In production, this would be replaced with the actual ZetaChain Universal Token
 */
contract MockUniversalToken is IUniversalToken, ERC20, Ownable {
    // Chain ID to balance mapping
    mapping(uint256 => mapping(address => uint256)) public chainBalances;
    mapping(uint256 => uint256) public chainTotalSupply;
    
    // Cross-chain transfer events
    event CrossChainMint(uint256 indexed chainId, address indexed recipient, uint256 amount);
    event CrossChainBurn(uint256 indexed chainId, address indexed from, uint256 amount);
    event CrossChainTransfer(uint256 indexed chainId, address indexed recipient, uint256 amount);
    
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) Ownable(msg.sender) {
        _mint(msg.sender, initialSupply);
        chainBalances[block.chainid][msg.sender] = initialSupply;
        chainTotalSupply[block.chainid] = initialSupply;
    }
    
    // ==================== IUniversalToken IMPLEMENTATION ====================
    
    function mintUniversal(
        uint256 chainId,
        address recipient,
        uint256 amount
    ) external override {
        require(msg.sender == owner() || msg.sender == address(this), "Not authorized");
        require(amount > 0, "Amount must be greater than 0");
        
        chainBalances[chainId][recipient] += amount;
        chainTotalSupply[chainId] += amount;
        
        emit CrossChainMint(chainId, recipient, amount);
    }
    
    function burnUniversal(
        uint256 chainId,
        address from,
        uint256 amount
    ) external override {
        require(msg.sender == owner() || msg.sender == address(this), "Not authorized");
        require(amount > 0, "Amount must be greater than 0");
        require(chainBalances[chainId][from] >= amount, "Insufficient balance");
        
        chainBalances[chainId][from] -= amount;
        chainTotalSupply[chainId] -= amount;
        
        emit CrossChainBurn(chainId, from, amount);
    }
    
    function transferUniversal(
        uint256 chainId,
        address recipient,
        uint256 amount
    ) external override {
        require(msg.sender == owner() || msg.sender == address(this), "Not authorized");
        require(amount > 0, "Amount must be greater than 0");
        require(chainBalances[block.chainid][address(this)] >= amount, "Insufficient balance");
        
        chainBalances[block.chainid][address(this)] -= amount;
        chainBalances[chainId][recipient] += amount;
        
        emit CrossChainTransfer(chainId, recipient, amount);
    }
    
    function balanceOfUniversal(uint256 chainId, address account) 
        external 
        view 
        override 
        returns (uint256) 
    {
        return chainBalances[chainId][account];
    }
    
    function totalSupplyUniversal(uint256 chainId) 
        external 
        view 
        override 
        returns (uint256) 
    {
        return chainTotalSupply[chainId];
    }
    
    // ==================== ERC20 OVERRIDES ====================
    
    function balanceOf(address account) public view override returns (uint256) {
        return chainBalances[block.chainid][account];
    }
    
    function totalSupply() public view override returns (uint256) {
        return chainTotalSupply[block.chainid];
    }
    
    function transfer(address to, uint256 amount) public override returns (bool) {
        address owner = _msgSender();
        _transfer(owner, to, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        address spender = _msgSender();
        _spendAllowance(from, spender, amount);
        _transfer(from, to, amount);
        return true;
    }
    
    function _transfer(address from, address to, uint256 amount) internal override {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");
        
        uint256 fromBalance = chainBalances[block.chainid][from];
        require(fromBalance >= amount, "ERC20: transfer amount exceeds balance");
        
        chainBalances[block.chainid][from] = fromBalance - amount;
        chainBalances[block.chainid][to] += amount;
        
        emit Transfer(from, to, amount);
    }
    
    function _mint(address account, uint256 amount) internal override {
        require(account != address(0), "ERC20: mint to the zero address");
        
        chainBalances[block.chainid][account] += amount;
        chainTotalSupply[block.chainid] += amount;
        
        emit Transfer(address(0), account, amount);
    }
    
    function _burn(address account, uint256 amount) internal override {
        require(account != address(0), "ERC20: burn from the zero address");
        
        uint256 accountBalance = chainBalances[block.chainid][account];
        require(accountBalance >= amount, "ERC20: burn amount exceeds balance");
        
        chainBalances[block.chainid][account] = accountBalance - amount;
        chainTotalSupply[block.chainid] -= amount;
        
        emit Transfer(account, address(0), amount);
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    function getChainBalance(uint256 chainId, address account) external view returns (uint256) {
        return chainBalances[chainId][account];
    }
    
    function getChainTotalSupply(uint256 chainId) external view returns (uint256) {
        return chainTotalSupply[chainId];
    }
    
    function getAllChainBalances(address account) external view returns (
        uint256[] memory chainIds,
        uint256[] memory balances
    ) {
        // Return balances for common chain IDs
        uint256[] memory commonChains = new uint256[](5);
        commonChains[0] = 1;    // Ethereum mainnet
        commonChains[1] = 137;  // Polygon
        commonChains[2] = 56;   // BSC
        commonChains[3] = 42161; // Arbitrum
        commonChains[4] = 10;   // Optimism
        
        uint256[] memory bal = new uint256[](5);
        for (uint256 i = 0; i < 5; i++) {
            bal[i] = chainBalances[commonChains[i]][account];
        }
        
        return (commonChains, bal);
    }
} 