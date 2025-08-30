import { useState, useEffect, useCallback } from 'react';
import { useWallet } from './useWallet';
import { useNotifications } from './useNotifications';

interface Loan {
    loanId: string;
    borrowerId: string;
    principal: number;
    interestRate: number;
    durationDays: number;
    collateralNFT: string;
    status: string;
    borrowedToken: string;
    borrowedAmount: number;
    collateralValue: number;
    ltvRatio: number;
    startDate: string;
    dueDate: string;
    liquidationFlag: boolean;
    sourceChainId?: number;
    destinationChainId?: number;
}

interface Position {
    nftId: string;
    name: string;
    ownerId: string;
    image: string;
    valuedUSD: number;
    locked: boolean;
    collection: string;
    rarityScore: number;
}

interface Pool {
    poolId: string;
    name: string;
    token: string;
    totalLiquidity: number;
    totalBorrowed: number;
    utilizationRate: number;
    apy: number;
    maxLTV: number;
}

interface Statistics {
    user: {
        totalLoans: number;
        activeLoans: number;
        totalBorrowed: number;
        totalCollateral: number;
    };
    global: {
        totalLoans: number;
        activeLoans: number;
        totalBorrowed: number;
        totalCollateral: number;
        totalLiquidity: number;
        totalUtilization: number;
    };
}

interface LoanRequest {
    borrowerId: string;
    principal: number;
    collateralNFT: string;
    durationDays: number;
    borrowedToken: string;
    sourceChainId: number;
    destinationChainId: number;
}

interface RepaymentRequest {
    loanId: string;
    repaymentAmount: number;
    sourceChainId: number;
    destinationChainId: number;
}

interface ExtensionRequest {
    loanId: string;
    extraDays: number;
    sourceChainId: number;
    destinationChainId: number;
}

interface CollateralLockRequest {
    nftId: string;
    userId: string;
    chainId: number;
}

interface CollateralUnlockRequest {
    nftId: string;
    userId: string;
    chainId: number;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export const useAvalon = () => {
    const { address, isConnected } = useWallet();
    const { showNotification } = useNotifications();

    const [loans, setLoans] = useState<Loan[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [pools, setPools] = useState<Pool[]>([]);
    const [statistics, setStatistics] = useState<Statistics | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch user's loans
    const fetchLoans = useCallback(async () => {
        if (!isConnected || !address) return;

        try {
            const response = await fetch(`${API_BASE_URL}/avalon/loans?userId=${address}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch loans');
            }

            const result = await response.json();
            if (result.success) {
                setLoans(result.data || []);
            } else {
                throw new Error(result.error || 'Failed to fetch loans');
            }
        } catch (error) {
            console.error('Error fetching loans:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch loans');
        }
    }, [isConnected, address]);

    // Fetch user's collateral positions
    const fetchPositions = useCallback(async () => {
        if (!isConnected || !address) return;

        try {
            const response = await fetch(`${API_BASE_URL}/avalon/collateral?userId=${address}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch collateral positions');
            }

            const result = await response.json();
            if (result.success) {
                setPositions(result.data || []);
            } else {
                throw new Error(result.error || 'Failed to fetch collateral positions');
            }
        } catch (error) {
            console.error('Error fetching positions:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch collateral positions');
        }
    }, [isConnected, address]);

    // Fetch lending pools
    const fetchPools = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/avalon/lending-pools`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch lending pools');
            }

            const result = await response.json();
            if (result.success) {
                setPools(result.data || []);
            } else {
                throw new Error(result.error || 'Failed to fetch lending pools');
            }
        } catch (error) {
            console.error('Error fetching pools:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch lending pools');
        }
    }, []);

    // Fetch statistics
    const fetchStatistics = useCallback(async () => {
        if (!isConnected || !address) return;

        try {
            const response = await fetch(`${API_BASE_URL}/avalon/statistics?userId=${address}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch statistics');
            }

            const result = await response.json();
            if (result.success) {
                setStatistics(result.data || null);
            } else {
                throw new Error(result.error || 'Failed to fetch statistics');
            }
        } catch (error) {
            console.error('Error fetching statistics:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch statistics');
        }
    }, [isConnected, address]);

    // Create a new loan
    const createLoan = useCallback(async (loanRequest: LoanRequest): Promise<ApiResponse<any>> => {
        if (!isConnected || !address) {
            throw new Error('Wallet not connected');
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/avalon/loans/create`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loanRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to create loan');
            }

            const result = await response.json();
            if (result.success) {
                // Refresh data after successful loan creation
                await Promise.all([fetchLoans(), fetchPositions(), fetchStatistics()]);
                return result;
            } else {
                throw new Error(result.error || 'Failed to create loan');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create loan';
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, address, fetchLoans, fetchPositions, fetchStatistics]);

    // Repay a loan
    const repayLoan = useCallback(async (repaymentRequest: RepaymentRequest): Promise<ApiResponse<any>> => {
        if (!isConnected || !address) {
            throw new Error('Wallet not connected');
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/avalon/loans/repay`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(repaymentRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to process repayment');
            }

            const result = await response.json();
            if (result.success) {
                // Refresh data after successful repayment
                await Promise.all([fetchLoans(), fetchPositions(), fetchStatistics()]);
                return result;
            } else {
                throw new Error(result.error || 'Failed to process repayment');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to process repayment';
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, address, fetchLoans, fetchPositions, fetchStatistics]);

    // Extend a loan
    const extendLoan = useCallback(async (extensionRequest: ExtensionRequest): Promise<ApiResponse<any>> => {
        if (!isConnected || !address) {
            throw new Error('Wallet not connected');
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/avalon/loans/extend`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(extensionRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to extend loan');
            }

            const result = await response.json();
            if (result.success) {
                // Refresh data after successful extension
                await fetchLoans();
                return result;
            } else {
                throw new Error(result.error || 'Failed to extend loan');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to extend loan';
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, address, fetchLoans]);

    // Lock collateral
    const lockCollateral = useCallback(async (lockRequest: CollateralLockRequest): Promise<ApiResponse<any>> => {
        if (!isConnected || !address) {
            throw new Error('Wallet not connected');
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/avalon/collateral/lock`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(lockRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to lock collateral');
            }

            const result = await response.json();
            if (result.success) {
                // Refresh data after successful lock
                await Promise.all([fetchPositions(), fetchStatistics()]);
                return result;
            } else {
                throw new Error(result.error || 'Failed to lock collateral');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to lock collateral';
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, address, fetchPositions, fetchStatistics]);

    // Unlock collateral
    const unlockCollateral = useCallback(async (unlockRequest: CollateralUnlockRequest): Promise<ApiResponse<any>> => {
        if (!isConnected || !address) {
            throw new Error('Wallet not connected');
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch(`${API_BASE_URL}/avalon/collateral/unlock`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(unlockRequest)
            });

            if (!response.ok) {
                throw new Error('Failed to unlock collateral');
            }

            const result = await response.json();
            if (result.success) {
                // Refresh data after successful unlock
                await Promise.all([fetchPositions(), fetchStatistics()]);
                return result;
            } else {
                throw new Error(result.error || 'Failed to unlock collateral');
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to unlock collateral';
            setError(errorMessage);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, address, fetchPositions, fetchStatistics]);

    // Get loan details
    const getLoanDetails = useCallback(async (loanId: string): Promise<Loan | null> => {
        if (!isConnected || !address) return null;

        try {
            const response = await fetch(`${API_BASE_URL}/avalon/loans/${loanId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch loan details');
            }

            const result = await response.json();
            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.error || 'Failed to fetch loan details');
            }
        } catch (error) {
            console.error('Error fetching loan details:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch loan details');
            return null;
        }
    }, [isConnected, address]);

    // Get position details
    const getPositionDetails = useCallback(async (nftId: string): Promise<Position | null> => {
        if (!isConnected || !address) return null;

        try {
            const positions = await fetchPositions();
            return positions.find(pos => pos.nftId === nftId) || null;
        } catch (error) {
            console.error('Error fetching position details:', error);
            return null;
        }
    }, [isConnected, address, fetchPositions]);

    // Refresh all data
    const refreshData = useCallback(async () => {
        if (!isConnected || !address) return;

        try {
            setIsLoading(true);
            await Promise.all([
                fetchLoans(),
                fetchPositions(),
                fetchPools(),
                fetchStatistics()
            ]);
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setIsLoading(false);
        }
    }, [isConnected, address, fetchLoans, fetchPositions, fetchPools, fetchStatistics]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Initial data fetch
    useEffect(() => {
        if (isConnected && address) {
            refreshData();
        }
    }, [isConnected, address, refreshData]);

    // Polling for real-time updates
    useEffect(() => {
        if (!isConnected || !address) return;

        const interval = setInterval(() => {
            fetchLoans();
            fetchStatistics();
        }, 30000); // Poll every 30 seconds

        return () => clearInterval(interval);
    }, [isConnected, address, fetchLoans, fetchStatistics]);

    return {
        // State
        loans,
        positions,
        pools,
        statistics,
        isLoading,
        error,

        // Actions
        createLoan,
        repayLoan,
        extendLoan,
        lockCollateral,
        unlockCollateral,
        getLoanDetails,
        getPositionDetails,
        refreshData,
        clearError,

        // Computed values
        activeLoans: loans.filter(loan => loan.status === 'active'),
        repaidLoans: loans.filter(loan => loan.status === 'repaid'),
        liquidatedLoans: loans.filter(loan => loan.status === 'liquidated'),
        lockedPositions: positions.filter(pos => pos.locked),
        unlockedPositions: positions.filter(pos => !pos.locked),

        // Utility functions
        getLoanById: (loanId: string) => loans.find(loan => loan.loanId === loanId),
        getPositionById: (nftId: string) => positions.find(pos => pos.nftId === nftId),
        getPoolById: (poolId: string) => pools.find(pool => pool.poolId === poolId),
        calculateTotalBorrowed: () => loans.reduce((sum, loan) => sum + loan.principal, 0),
        calculateTotalCollateral: () => positions.filter(pos => pos.locked).reduce((sum, pos) => sum + pos.valuedUSD, 0),
        calculateAverageLTV: () => {
            const activeLoans = loans.filter(loan => loan.status === 'active');
            if (activeLoans.length === 0) return 0;
            return activeLoans.reduce((sum, loan) => sum + loan.ltvRatio, 0) / activeLoans.length;
        }
    };
};
