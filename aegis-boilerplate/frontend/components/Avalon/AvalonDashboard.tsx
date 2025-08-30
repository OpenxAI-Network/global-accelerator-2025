import React, { useState, useEffect } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useAvalon } from '../../hooks/useAvalon';
import { useNotifications } from '../../hooks/useNotifications';
import { 
    WalletIcon, DocumentTextIcon, ShieldCheckIcon,
    ExclamationTriangleIcon, CheckCircleIcon, ClockIcon,
    CurrencyDollarIcon, ChartBarIcon, LockClosedIcon,
    LockOpenIcon, ArrowPathIcon, PlusIcon
} from '@heroicons/react/24/outline';

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

const AvalonDashboard: React.FC = () => {
    const { address, isConnected } = useWallet();
    const { 
        loans, positions, pools, statistics, isLoading, error,
        createLoan, repayLoan, extendLoan, lockCollateral, unlockCollateral
    } = useAvalon();
    const { showNotification } = useNotifications();

    const [activeTab, setActiveTab] = useState<'overview' | 'loans' | 'collateral' | 'pools' | 'create'>('overview');
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [showLoanModal, setShowLoanModal] = useState(false);
    const [showRepayModal, setShowRepayModal] = useState(false);
    const [showExtendModal, setShowExtendModal] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);

    const [loanRequest, setLoanRequest] = useState({
        principal: '',
        collateralNFT: '',
        durationDays: '',
        borrowedToken: 'ZETA',
        sourceChainId: 1,
        destinationChainId: 137
    });

    const [repaymentForm, setRepaymentForm] = useState({
        repaymentAmount: '',
        sourceChainId: 1,
        destinationChainId: 137
    });

    const [extensionForm, setExtensionForm] = useState({
        extraDays: '',
        sourceChainId: 1,
        destinationChainId: 137
    });

    const [lockForm, setLockForm] = useState({
        nftId: '',
        chainId: 1
    });

    useEffect(() => {
        if (error) {
            showNotification('error', error);
        }
    }, [error, showNotification]);

    const handleLoanRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await createLoan({
                borrowerId: address!,
                principal: parseFloat(loanRequest.principal),
                collateralNFT: loanRequest.collateralNFT,
                durationDays: parseInt(loanRequest.durationDays),
                borrowedToken: loanRequest.borrowedToken,
                sourceChainId: loanRequest.sourceChainId,
                destinationChainId: loanRequest.destinationChainId
            });

            if (result.success) {
                showNotification('success', 'Loan created successfully!');
                setShowLoanModal(false);
                setLoanRequest({
                    principal: '',
                    collateralNFT: '',
                    durationDays: '',
                    borrowedToken: 'ZETA',
                    sourceChainId: 1,
                    destinationChainId: 137
                });
            }
        } catch (error) {
            showNotification('error', 'Failed to create loan');
        }
    };

    const handleRepayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoan) return;

        try {
            const result = await repayLoan({
                loanId: selectedLoan.loanId,
                repaymentAmount: parseFloat(repaymentForm.repaymentAmount),
                sourceChainId: repaymentForm.sourceChainId,
                destinationChainId: repaymentForm.destinationChainId
            });

            if (result.success) {
                showNotification('success', 'Repayment processed successfully!');
                setShowRepayModal(false);
                setSelectedLoan(null);
                setRepaymentForm({
                    repaymentAmount: '',
                    sourceChainId: 1,
                    destinationChainId: 137
                });
            }
        } catch (error) {
            showNotification('error', 'Failed to process repayment');
        }
    };

    const handleExtension = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLoan) return;

        try {
            const result = await extendLoan({
                loanId: selectedLoan.loanId,
                extraDays: parseInt(extensionForm.extraDays),
                sourceChainId: extensionForm.sourceChainId,
                destinationChainId: extensionForm.destinationChainId
            });

            if (result.success) {
                showNotification('success', 'Loan extended successfully!');
                setShowExtendModal(false);
                setSelectedLoan(null);
                setExtensionForm({
                    extraDays: '',
                    sourceChainId: 1,
                    destinationChainId: 137
                });
            }
        } catch (error) {
            showNotification('error', 'Failed to extend loan');
        }
    };

    const handleLockCollateral = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await lockCollateral({
                nftId: lockForm.nftId,
                userId: address!,
                chainId: lockForm.chainId
            });

            if (result.success) {
                showNotification('success', 'Collateral locked successfully!');
                setShowLockModal(false);
                setLockForm({
                    nftId: '',
                    chainId: 1
                });
            }
        } catch (error) {
            showNotification('error', 'Failed to lock collateral');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'text-green-600 bg-green-100';
            case 'repaid': return 'text-blue-600 bg-blue-100';
            case 'liquidated': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active': return <CheckCircleIcon className="w-5 h-5" />;
            case 'repaid': return <CheckCircleIcon className="w-5 h-5" />;
            case 'liquidated': return <ExclamationTriangleIcon className="w-5 h-5" />;
            default: return <ClockIcon className="w-5 h-5" />;
        }
    };

    if (!isConnected) {
        return (
            <div className="text-center py-12">
                <WalletIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
                <p className="text-gray-500">Connect your wallet to access Avalon lending features</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <ArrowPathIcon className="w-8 h-8 mx-auto text-blue-600 animate-spin mb-4" />
                <p className="text-gray-600">Loading Avalon dashboard...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Avalon Finance Dashboard</h1>
                        <p className="text-gray-600 mt-1">Cross-chain lending with ZETA tokens</p>
                    </div>
                    <div className="flex space-x-3">
                        <button
                            onClick={() => setShowLoanModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Create Loan
                        </button>
                        <button
                            onClick={() => setShowLockModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <LockClosedIcon className="w-4 h-4 mr-2" />
                            Lock Collateral
                        </button>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            {statistics && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <DocumentTextIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Active Loans</p>
                                <p className="text-2xl font-semibold text-gray-900">{statistics.user.activeLoans}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <CurrencyDollarIcon className="w-8 h-8 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Borrowed</p>
                                <p className="text-2xl font-semibold text-gray-900">${statistics.user.totalBorrowed.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ShieldCheckIcon className="w-8 h-8 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Total Collateral</p>
                                <p className="text-2xl font-semibold text-gray-900">${statistics.user.totalCollateral.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <ChartBarIcon className="w-8 h-8 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-500">Global Utilization</p>
                                <p className="text-2xl font-semibold text-gray-900">{statistics.global.totalUtilization.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8 px-6">
                        {[
                            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
                            { id: 'loans', label: 'My Loans', icon: DocumentTextIcon },
                            { id: 'collateral', label: 'Collateral', icon: ShieldCheckIcon },
                            { id: 'pools', label: 'Lending Pools', icon: CurrencyDollarIcon }
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                <tab.icon className="w-5 h-5 inline mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                <div className="p-6">
                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-600">No recent activity</p>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => setShowLoanModal(true)}
                                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 hover:text-blue-600"
                                    >
                                        <PlusIcon className="w-8 h-8 mx-auto mb-2" />
                                        <p className="font-medium">Create New Loan</p>
                                    </button>
                                    <button
                                        onClick={() => setShowLockModal(true)}
                                        className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-blue-400 hover:text-blue-600"
                                    >
                                        <LockClosedIcon className="w-8 h-8 mx-auto mb-2" />
                                        <p className="font-medium">Lock Collateral</p>
                                    </button>
                                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                                        <ChartBarIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                        <p className="font-medium text-gray-400">View Analytics</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Loans Tab */}
                    {activeTab === 'loans' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">My Loans</h3>
                                <button
                                    onClick={() => setShowLoanModal(true)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <PlusIcon className="w-4 h-4 mr-2" />
                                    New Loan
                                </button>
                            </div>

                            {loans.length === 0 ? (
                                <div className="text-center py-8">
                                    <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500">No loans found</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {loans.map((loan) => (
                                        <div key={loan.loanId} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className={`p-2 rounded-full ${getStatusColor(loan.status)}`}>
                                                        {getStatusIcon(loan.status)}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Loan {loan.loanId}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {loan.borrowedToken} {loan.borrowedAmount.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        ${loan.principal.toLocaleString()}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        LTV: {loan.ltvRatio.toFixed(1)}%
                                                    </p>
                                                </div>
                                                <div className="flex space-x-2">
                                                    {loan.status === 'active' && (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedLoan(loan);
                                                                    setShowRepayModal(true);
                                                                }}
                                                                className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                                            >
                                                                Repay
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedLoan(loan);
                                                                    setShowExtendModal(true);
                                                                }}
                                                                className="px-3 py-1 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                                            >
                                                                Extend
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Collateral Tab */}
                    {activeTab === 'collateral' && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium text-gray-900">My Collateral</h3>
                                <button
                                    onClick={() => setShowLockModal(true)}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <LockClosedIcon className="w-4 h-4 mr-2" />
                                    Lock NFT
                                </button>
                            </div>

                            {positions.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShieldCheckIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500">No collateral positions found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {positions.map((position) => (
                                        <div key={position.nftId} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={position.image}
                                                    alt={position.name}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900">{position.name}</p>
                                                    <p className="text-sm text-gray-500">{position.collection}</p>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        ${position.valuedUSD.toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {position.locked ? (
                                                        <LockClosedIcon className="w-6 h-6 text-red-600" />
                                                    ) : (
                                                        <LockOpenIcon className="w-6 h-6 text-green-600" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Pools Tab */}
                    {activeTab === 'pools' && (
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-gray-900">Available Lending Pools</h3>
                            
                            {pools.length === 0 ? (
                                <div className="text-center py-8">
                                    <CurrencyDollarIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                    <p className="text-gray-500">No lending pools available</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {pools.map((pool) => (
                                        <div key={pool.poolId} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">{pool.name}</h4>
                                                    <p className="text-sm text-gray-500">
                                                        {pool.token} • Max LTV: {pool.maxLTV}%
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-semibold text-gray-900">
                                                        {pool.apy * 100}% APY
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {pool.utilizationRate}% utilized
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-200">
                                                <div className="grid grid-cols-3 gap-4 text-center">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Total Liquidity</p>
                                                        <p className="font-medium text-gray-900">
                                                            ${pool.totalLiquidity.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Total Borrowed</p>
                                                        <p className="font-medium text-gray-900">
                                                            ${pool.totalBorrowed.toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Available</p>
                                                        <p className="font-medium text-gray-900">
                                                            ${(pool.totalLiquidity - pool.totalBorrowed).toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Loan Modal */}
            {showLoanModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Loan</h3>
                            <form onSubmit={handleLoanRequest} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Principal Amount</label>
                                    <input
                                        type="number"
                                        value={loanRequest.principal}
                                        onChange={(e) => setLoanRequest({...loanRequest, principal: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="1000"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Collateral NFT ID</label>
                                    <input
                                        type="text"
                                        value={loanRequest.collateralNFT}
                                        onChange={(e) => setLoanRequest({...loanRequest, collateralNFT: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="2149"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration (days)</label>
                                    <input
                                        type="number"
                                        value={loanRequest.durationDays}
                                        onChange={(e) => setLoanRequest({...loanRequest, durationDays: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="30"
                                        required
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowLoanModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Create Loan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Repay Loan Modal */}
            {showRepayModal && selectedLoan && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Repay Loan</h3>
                            <form onSubmit={handleRepayment} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Repayment Amount</label>
                                    <input
                                        type="number"
                                        value={repaymentForm.repaymentAmount}
                                        onChange={(e) => setRepaymentForm({...repaymentForm, repaymentAmount: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="1000"
                                        required
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowRepayModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Repay
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Extend Loan Modal */}
            {showExtendModal && selectedLoan && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Extend Loan</h3>
                            <form onSubmit={handleExtension} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Extra Days</label>
                                    <input
                                        type="number"
                                        value={extensionForm.extraDays}
                                        onChange={(e) => setExtensionForm({...extensionForm, extraDays: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="30"
                                        required
                                    />
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowExtendModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                                    >
                                        Extend
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Lock Collateral Modal */}
            {showLockModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Lock NFT as Collateral</h3>
                            <form onSubmit={handleLockCollateral} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">NFT ID</label>
                                    <input
                                        type="text"
                                        value={lockForm.nftId}
                                        onChange={(e) => setLockForm({...lockForm, nftId: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        placeholder="2149"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Chain ID</label>
                                    <select
                                        value={lockForm.chainId}
                                        onChange={(e) => setLockForm({...lockForm, chainId: parseInt(e.target.value)})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                    >
                                        <option value={1}>Ethereum</option>
                                        <option value={137}>Polygon</option>
                                        <option value={56}>BSC</option>
                                        <option value={42161}>Arbitrum</option>
                                    </select>
                                </div>
                                <div className="flex space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowLockModal(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Lock NFT
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AvalonDashboard;
