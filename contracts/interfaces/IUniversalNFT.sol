// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IUniversalNFT
 * @dev Interface for Universal NFTs that can be transferred across chains
 */
interface IUniversalNFT {
    /**
     * @dev Transfer NFT across chains
     * @param from The sender address
     * @param to The recipient address
     * @param tokenId The NFT token ID
     */
    function transferNFT(
        address from,
        address to,
        uint256 tokenId
    ) external;

    /**
     * @dev Get NFT metadata
     * @param tokenId The NFT token ID
     * @return contractAddress The original contract address
     * @return originalChainId The original chain ID
     * @return owner The current owner
     */
    function getNFTMetadata(uint256 tokenId)
        external
        view
        returns (
            address contractAddress,
            uint256 originalChainId,
            address owner
        );

    /**
     * @dev Check if NFT exists
     * @param tokenId The NFT token ID
     * @return True if the NFT exists
     */
    function exists(uint256 tokenId) external view returns (bool);

    /**
     * @dev Get the total number of NFTs
     * @return The total count
     */
    function totalSupply() external view returns (uint256);
} 