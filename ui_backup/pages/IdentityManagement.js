import React, { useState, useEffect } from 'react';
import WalletLinking from '../components/WalletLinking';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const IdentityManagement = () => {
    const [userAddress, setUserAddress] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // =============================================================================
    // EFFECTS
    // =============================================================================

    useEffect(() => {
        checkWalletConnection();
    }, []);

    // =============================================================================
    // WALLET CONNECTION
    // =============================================================================

    const checkWalletConnection = async () => {
        if (window.ethereum) {
            try {
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    setUserAddress(accounts[0]);
                    setIsConnected(true);
                    fetchUserProfile(accounts[0]);
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
            }
        }
    };

    const connectWallet = async () => {
        if (!window.ethereum) {
            setError('MetaMask or other EVM wallet is required');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts.length > 0) {
                setUserAddress(accounts[0]);
                setIsConnected(true);
                await fetchUserProfile(accounts[0]);
            }
        } catch (error) {
            setError('Failed to connect wallet: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    // =============================================================================
    // USER PROFILE MANAGEMENT
    // =============================================================================

    const fetchUserProfile = async (address) => {
        try {
            // TODO: Fetch from actual API
            // For now, create a mock profile
            const mockProfile = {
                address,
                username: `User_${address.slice(2, 8)}`,
                avatarHash: 'QmExampleAvatarHash',
                reputationScore: 85,
                totalLinkedWallets: 0,
                createdAt: Date.now(),
                isVerified: false
            };
            setUserProfile(mockProfile);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const updateProfile = async (updates) => {
        try {
            // TODO: Update via API
            setUserProfile(prev => ({ ...prev, ...updates }));
        } catch (error) {
            setError('Failed to update profile: ' + error.message);
        }
    };

    // =============================================================================
    // EVENT HANDLERS
    // =============================================================================

    const handleWalletLinked = (chainType, address) => {
        if (userProfile) {
            setUserProfile(prev => ({
                ...prev,
                totalLinkedWallets: prev.totalLinkedWallets + 1
            }));
        }
    };

    const handleDisconnect = () => {
        setUserAddress('');
        setIsConnected(false);
        setUserProfile(null);
        setError('');
    };

    // =============================================================================
    // RENDER FUNCTIONS
    // =============================================================================

    const renderHeader = () => (
        <div className="identity-header">
            <div className="header-content">
                <div className="header-left">
                    <h1>
                        <i className="fas fa-id-card"></i>
                        Identity Management
                    </h1>
                    <p>Manage your unified Aegis identity across multiple blockchains</p>
                </div>
                <div className="header-right">
                    {!isConnected ? (
                        <button
                            onClick={connectWallet}
                            disabled={isLoading}
                            className="btn btn-primary"
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin"></i>
                                    Connecting...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-wallet"></i>
                                    Connect Wallet
                                </>
                            )}
                        </button>
                    ) : (
                        <div className="wallet-info">
                            <span className="address">
                                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                            </span>
                            <button onClick={handleDisconnect} className="btn btn-secondary btn-sm">
                                <i className="fas fa-sign-out-alt"></i>
                                Disconnect
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderUserProfile = () => (
        userProfile && (
            <div className="user-profile-section">
                <div className="profile-header">
                    <h2>
                        <i className="fas fa-user"></i>
                        Your Profile
                    </h2>
                </div>
                <div className="profile-content">
                    <div className="profile-avatar">
                        <div className="avatar-placeholder">
                            <i className="fas fa-user-circle"></i>
                        </div>
                    </div>
                    <div className="profile-details">
                        <div className="profile-field">
                            <label>Username:</label>
                            <span>{userProfile.username}</span>
                        </div>
                        <div className="profile-field">
                            <label>Address:</label>
                            <span className="address">{userProfile.address}</span>
                        </div>
                        <div className="profile-field">
                            <label>Reputation Score:</label>
                            <span className="reputation">
                                {userProfile.reputationScore}/100
                                <div className="reputation-bar">
                                    <div 
                                        className="reputation-fill" 
                                        style={{ width: `${userProfile.reputationScore}%` }}
                                    ></div>
                                </div>
                            </span>
                        </div>
                        <div className="profile-field">
                            <label>Linked Wallets:</label>
                            <span>{userProfile.totalLinkedWallets}</span>
                        </div>
                        <div className="profile-field">
                            <label>Member Since:</label>
                            <span>{new Date(userProfile.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="profile-field">
                            <label>Verification:</label>
                            <span className={`verification ${userProfile.isVerified ? 'verified' : 'unverified'}`}>
                                {userProfile.isVerified ? (
                                    <>
                                        <i className="fas fa-check-circle"></i>
                                        Verified
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-clock"></i>
                                        Pending
                                    </>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    );

    const renderStats = () => (
        <div className="identity-stats">
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-shield-alt"></i>
                </div>
                <div className="stat-content">
                    <h3>Security Level</h3>
                    <p className="stat-value">High</p>
                    <span className="stat-description">Multi-chain verification</span>
                </div>
            </div>
            
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-link"></i>
                </div>
                <div className="stat-content">
                    <h3>Cross-Chain Access</h3>
                    <p className="stat-value">{userProfile?.totalLinkedWallets || 0}</p>
                    <span className="stat-description">Connected networks</span>
                </div>
            </div>
            
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-star"></i>
                </div>
                <div className="stat-content">
                    <h3>Reputation</h3>
                    <p className="stat-value">{userProfile?.reputationScore || 0}/100</p>
                    <span className="stat-description">Trust score</span>
                </div>
            </div>
            
            <div className="stat-card">
                <div className="stat-icon">
                    <i className="fas fa-clock"></i>
                </div>
                <div className="stat-content">
                    <h3>Account Age</h3>
                    <p className="stat-value">
                        {userProfile ? 
                            Math.floor((Date.now() - userProfile.createdAt) / (1000 * 60 * 60 * 24)) : 0
                        }d
                    </p>
                    <span className="stat-description">Days active</span>
                </div>
            </div>
        </div>
    );

    const renderError = () => (
        error && (
            <div className="error-banner">
                <i className="fas fa-exclamation-triangle"></i>
                <span>{error}</span>
                <button onClick={() => setError('')} className="close-error">
                    <i className="fas fa-times"></i>
                </button>
            </div>
        )
    );

    // =============================================================================
    // MAIN RENDER
    // =============================================================================

    return (
        <div className="identity-management-page">
            {renderHeader()}
            {renderError()}
            
            <div className="identity-content">
                {isConnected ? (
                    <>
                        {renderUserProfile()}
                        {renderStats()}
                        <WalletLinking 
                            userAddress={userAddress} 
                            onWalletLinked={handleWalletLinked}
                        />
                    </>
                ) : (
                    <div className="connect-prompt">
                        <div className="prompt-content">
                            <i className="fas fa-wallet"></i>
                            <h2>Connect Your Wallet</h2>
                            <p>To manage your Aegis identity and link multi-chain wallets, please connect your EVM wallet first.</p>
                            <button
                                onClick={connectWallet}
                                disabled={isLoading}
                                className="btn btn-primary btn-large"
                            >
                                {isLoading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Connecting...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-plug"></i>
                                        Connect Wallet
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IdentityManagement;
