import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// =============================================================================
// CONSTANTS
// =============================================================================

const CHAIN_TYPES = {
    BTC: {
        name: 'Bitcoin',
        icon: '₿',
        color: '#f7931a',
        description: 'Link your Bitcoin wallet for cross-chain operations'
    },
    SOLANA: {
        name: 'Solana',
        icon: '◎',
        color: '#14f195',
        description: 'Connect your Solana wallet for DeFi integration'
    },
    AVAX: {
        name: 'Avalanche',
        icon: '🟠',
        color: '#e84142',
        description: 'Link your Avalanche C-Chain wallet'
    },
    BASE: {
        name: 'Base',
        icon: '🔵',
        color: '#0052ff',
        description: 'Connect your Base L2 wallet'
    },
    POLYGON: {
        name: 'Polygon',
        icon: '🟣',
        color: '#8247e5',
        description: 'Link your Polygon wallet'
    }
};

const SUPPORTED_CHAINS = {
    1: 'Ethereum Mainnet',
    56: 'Binance Smart Chain',
    137: 'Polygon',
    42161: 'Arbitrum One',
    10: 'Optimism',
    8453: 'Base',
    1101: 'Polygon zkEVM',
    59144: 'Linea',
    7000: 'ZetaChain'
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const WalletLinking = ({ userAddress, onWalletLinked }) => {
    const [linkedWallets, setLinkedWallets] = useState({});
    const [linkingStatus, setLinkingStatus] = useState({});
    const [selectedChain, setSelectedChain] = useState(null);
    const [walletAddress, setWalletAddress] = useState('');
    const [isLinking, setIsLinking] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // =============================================================================
    // EFFECTS
    // =============================================================================

    useEffect(() => {
        if (userAddress) {
            fetchLinkedWallets();
        }
    }, [userAddress]);

    // =============================================================================
    // API FUNCTIONS
    // =============================================================================

    const fetchLinkedWallets = async () => {
        try {
            const response = await fetch(`/api/identity/user/${userAddress}`);
            if (response.ok) {
                const data = await response.json();
                setLinkedWallets(data.data.linkedWallets || {});
            }
        } catch (error) {
            console.error('Error fetching linked wallets:', error);
        }
    };

    const linkWallet = async (chainType, address, signature, message) => {
        try {
            const endpoint = `/api/identity/link/${chainType.toLowerCase()}`;
            const payload = {
                evmAddress: userAddress,
                [chainType === 'BTC' ? 'btcAddress' : `${chainType.toLowerCase()}Address`]: address,
                signature,
                message,
                timestamp: Math.floor(Date.now() / 1000)
            };

            if (chainType === 'EVM') {
                payload.primaryAddress = userAddress;
                payload.secondaryAddress = address;
                payload.chainId = selectedChain;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                const data = await response.json();
                setSuccess(`${CHAIN_TYPES[chainType]?.name || chainType} wallet linked successfully!`);
                setLinkedWallets(prev => ({
                    ...prev,
                    [chainType]: address
                }));
                onWalletLinked?.(chainType, address);
                resetForm();
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to link wallet');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLinking(false);
        }
    };

    // =============================================================================
    // WALLET INTERACTION FUNCTIONS
    // =============================================================================

    const requestSignature = async (chainType, address, message) => {
        try {
            let signature = '';

            if (chainType === 'BTC') {
                // For BTC, we'd need a BTC wallet integration
                // This is a placeholder for demonstration
                signature = await requestBTCSignature(address, message);
            } else if (chainType === 'SOLANA') {
                // For Solana, we'd need a Solana wallet integration
                signature = await requestSolanaSignature(address, message);
            } else if (chainType === 'EVM') {
                // For EVM chains, use MetaMask or similar
                signature = await requestEVMSignature(address, message);
            }

            return signature;
        } catch (error) {
            throw new Error(`Failed to get signature: ${error.message}`);
        }
    };

    const requestBTCSignature = async (address, message) => {
        // Placeholder for BTC wallet integration
        // In production, integrate with actual BTC wallet
        return new Promise((resolve, reject) => {
            // Simulate BTC signature request
            setTimeout(() => {
                if (window.confirm(`BTC Wallet: Sign message "${message}" for address ${address}?`)) {
                    resolve('btc_signature_placeholder');
                } else {
                    reject(new Error('User rejected BTC signature'));
                }
            }, 100);
        });
    };

    const requestSolanaSignature = async (address, message) => {
        // Placeholder for Solana wallet integration
        // In production, integrate with Phantom or other Solana wallets
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (window.confirm(`Solana Wallet: Sign message "${message}" for address ${address}?`)) {
                    resolve('solana_signature_placeholder');
                } else {
                    reject(new Error('User rejected Solana signature'));
                }
            }, 100);
        });
    };

    const requestEVMSignature = async (address, message) => {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask or other EVM wallet not found');
            }

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            
            // Sign the message
            const signature = await signer.signMessage(message);
            return signature;
        } catch (error) {
            throw new Error(`EVM signature failed: ${error.message}`);
        }
    };

    // =============================================================================
    // EVENT HANDLERS
    // =============================================================================

    const handleLinkWallet = async () => {
        if (!selectedChain || !walletAddress.trim()) {
            setError('Please select a chain and enter wallet address');
            return;
        }

        setIsLinking(true);
        setError('');
        setSuccess('');

        try {
            const chainType = selectedChain;
            const address = walletAddress.trim();
            const message = `Link ${CHAIN_TYPES[chainType]?.name || chainType} wallet ${address} to Aegis AI identity ${userAddress}`;

            // Get signature from wallet
            const signature = await requestSignature(chainType, address, message);

            // Link wallet via API
            await linkWallet(chainType, address, signature, message);

        } catch (error) {
            setError(error.message);
        }
    };

    const handleUnlinkWallet = async (chainType) => {
        if (!window.confirm(`Are you sure you want to unlink your ${CHAIN_TYPES[chainType]?.name || chainType} wallet?`)) {
            return;
        }

        try {
            const message = `Unlink ${CHAIN_TYPES[chainType]?.name || chainType} wallet from Aegis AI identity ${userAddress}`;
            const signature = await requestEVMSignature(userAddress, message);

            const response = await fetch(`/api/identity/unlink/${chainType.toLowerCase()}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    evmAddress: userAddress,
                    signature,
                    message,
                    timestamp: Math.floor(Date.now() / 1000)
                })
            });

            if (response.ok) {
                setSuccess(`${CHAIN_TYPES[chainType]?.name || chainType} wallet unlinked successfully!`);
                setLinkedWallets(prev => {
                    const newState = { ...prev };
                    delete newState[chainType];
                    return newState;
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to unlink wallet');
            }
        } catch (error) {
            setError(error.message);
        }
    };

    const resetForm = () => {
        setSelectedChain(null);
        setWalletAddress('');
        setError('');
        setSuccess('');
    };

    // =============================================================================
    // RENDER FUNCTIONS
    // =============================================================================

    const renderChainSelector = () => (
        <div className="chain-selector">
            <h3>Select Chain to Link</h3>
            <div className="chain-grid">
                {Object.entries(CHAIN_TYPES).map(([key, chain]) => (
                    <div
                        key={key}
                        className={`chain-option ${selectedChain === key ? 'selected' : ''} ${linkedWallets[key] ? 'linked' : ''}`}
                        onClick={() => !linkedWallets[key] && setSelectedChain(key)}
                    >
                        <div className="chain-icon" style={{ color: chain.color }}>
                            {chain.icon}
                        </div>
                        <div className="chain-info">
                            <h4>{chain.name}</h4>
                            <p>{chain.description}</p>
                        </div>
                        {linkedWallets[key] && (
                            <div className="linked-badge">
                                <i className="fas fa-check"></i>
                                Linked
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderWalletInput = () => (
        selectedChain && (
            <div className="wallet-input">
                <h3>Link {CHAIN_TYPES[selectedChain]?.name || selectedChain} Wallet</h3>
                <div className="input-group">
                    <label htmlFor="walletAddress">Wallet Address:</label>
                    <input
                        id="walletAddress"
                        type="text"
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value)}
                        placeholder={`Enter ${CHAIN_TYPES[selectedChain]?.name || selectedChain} address`}
                        className="wallet-address-input"
                    />
                </div>
                <div className="button-group">
                    <button
                        onClick={handleLinkWallet}
                        disabled={isLinking || !walletAddress.trim()}
                        className="btn btn-primary"
                    >
                        {isLinking ? (
                            <>
                                <i className="fas fa-spinner fa-spin"></i>
                                Linking...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-link"></i>
                                Link Wallet
                            </>
                        )}
                    </button>
                    <button
                        onClick={resetForm}
                        className="btn btn-secondary"
                        disabled={isLinking}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        )
    );

    const renderLinkedWallets = () => (
        <div className="linked-wallets">
            <h3>Your Linked Wallets</h3>
            {Object.keys(linkedWallets).length === 0 ? (
                <p className="no-wallets">No wallets linked yet. Link your first wallet above.</p>
            ) : (
                <div className="wallet-list">
                    {Object.entries(linkedWallets).map(([chainType, address]) => (
                        <div key={chainType} className="linked-wallet-item">
                            <div className="wallet-info">
                                <div className="chain-icon" style={{ color: CHAIN_TYPES[chainType]?.color }}>
                                    {CHAIN_TYPES[chainType]?.icon}
                                </div>
                                <div className="wallet-details">
                                    <h4>{CHAIN_TYPES[chainType]?.name || chainType}</h4>
                                    <p className="wallet-address">{address}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => handleUnlinkWallet(chainType)}
                                className="btn btn-danger btn-sm"
                            >
                                <i className="fas fa-unlink"></i>
                                Unlink
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const renderMessages = () => (
        <>
            {error && (
                <div className="message error">
                    <i className="fas fa-exclamation-circle"></i>
                    {error}
                </div>
            )}
            {success && (
                <div className="message success">
                    <i className="fas fa-check-circle"></i>
                    {success}
                </div>
            )}
        </>
    );

    // =============================================================================
    // MAIN RENDER
    // =============================================================================

    if (!userAddress) {
        return (
            <div className="wallet-linking-container">
                <div className="no-address">
                    <i className="fas fa-wallet"></i>
                    <h3>Connect Your Wallet</h3>
                    <p>Please connect your EVM wallet to start linking other wallets.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="wallet-linking-container">
            <div className="wallet-linking-header">
                <h2>
                    <i className="fas fa-link"></i>
                    Multi-Chain Wallet Linking
                </h2>
                <p>Connect your wallets across different blockchains to create a unified Aegis identity</p>
            </div>

            {renderMessages()}

            <div className="wallet-linking-content">
                {renderChainSelector()}
                {renderWalletInput()}
                {renderLinkedWallets()}
            </div>

            <div className="wallet-linking-info">
                <h4>
                    <i className="fas fa-info-circle"></i>
                    How It Works
                </h4>
                <ul>
                    <li>Your EVM address on ZetaChain serves as your primary identity</li>
                    <li>Other chain wallets are linked through cryptographic signatures</li>
                    <li>All linked wallets are associated with your unified Aegis profile</li>
                    <li>Cross-chain operations can be performed using any linked wallet</li>
                </ul>
            </div>
        </div>
    );
};

export default WalletLinking;
