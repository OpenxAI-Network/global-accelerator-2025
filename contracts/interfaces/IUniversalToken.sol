// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IUniversalToken
 * @dev Interface for Universal Tokens that can be minted/burned across chains
 */
interface IUniversalToken {
    /**
     * @dev Mint tokens on a specific chain
     * @param chainId The target chain ID
     * @param recipient The recipient of the minted tokens
     * @param amount The amount to mint
     */
    function mintUniversal(
        uint256 chainId,
        address recipient,
        uint256 amount
    ) external;

    /**
     * @dev Burn tokens from a specific chain
     * @param chainId The source chain ID
     * @param from The address to burn tokens from
     * @param amount The amount to burn
     */
    function burnUniversal(
        uint256 chainId,
        address from,
        uint256 amount
    ) external;

    /**
     * @dev Transfer tokens across chains
     * @param chainId The target chain ID
     * @param recipient The recipient on the target chain
     * @param amount The amount to transfer
     */
    function transferUniversal(
        uint256 chainId,
        address recipient,
        uint256 amount
    ) external;

    /**
     * @dev Get the balance of tokens on a specific chain
     * @param chainId The chain ID
     * @param account The account address
     * @return The token balance
     */
    function balanceOfUniversal(uint256 chainId, address account) 
        external 
        view 
        returns (uint256);

    /**
     * @dev Get the total supply on a specific chain
     * @param chainId The chain ID
     * @return The total supply
     */
    function totalSupplyUniversal(uint256 chainId) 
        external 
        view 
        returns (uint256);
} 