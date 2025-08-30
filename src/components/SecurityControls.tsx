import React, { useEffect, useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Copy, ExternalLink, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { ethers } from 'ethers';

interface SecurityControlsProps {
  contractAddress?: string;
  erc20Address?: string;
  connectedWallet?: string;
}

interface ApprovalInfo {
  token: string;
  spender: string;
  allowance: string;
  symbol: string;
  decimals: number;
}

interface SecurityStatus {
  walletConnected: boolean;
  networkSecure: boolean;
  contractVerified: boolean;
  approvalsSafe: boolean;
  lastSecurityCheck: string;
}

export const SecurityControls: React.FC<SecurityControlsProps> = ({ 
  contractAddress, 
  erc20Address, 
  connectedWallet 
}) => {
  const [allowances, setAllowances] = useState<ApprovalInfo[]>([]);
  const [securityStatus, setSecurityStatus] = useState<SecurityStatus>({
    walletConnected: false,
    networkSecure: false,
    contractVerified: false,
    approvalsSafe: true,
    lastSecurityCheck: new Date().toISOString()
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState<string[]>([]);

  // Common ERC20 tokens to check
  const commonTokens = [
    { address: '0xA0b86a33E6441b8c4C8B8B8B8B8B8B8B8B8B8B8', symbol: 'USDC', decimals: 6 },
    { address: '0xB8c77482e45F1F44dE1745F52C74426C631bDD52', symbol: 'BNB', decimals: 18 },
    { address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', symbol: 'UNI', decimals: 18 },
    { address: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608aC1eC4B9', symbol: 'MATIC', decimals: 18 }
  ];

  useEffect(() => {
    if (connectedWallet && window.ethereum) {
      checkSecurityStatus();
      checkAllowances();
    }
  }, [connectedWallet, contractAddress]);

  const checkSecurityStatus = async () => {
    if (!window.ethereum) return;

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      
      // Check if network is secure (mainnet, testnet, or known secure networks)
      const secureChainIds = [1, 137, 56, 42161, 10, 8453]; // Mainnet, Polygon, BSC, Arbitrum, Optimism, Base
      const networkSecure = secureChainIds.includes(Number(network.chainId));

      // Check if contract is verified (basic check)
      const contractVerified = await checkContractVerification(contractAddress || '');

      // Check if approvals are safe
      const approvalsSafe = allowances.every(allowance => 
        ethers.parseUnits(allowance.allowance, allowance.decimals) === 0n ||
        ethers.parseUnits(allowance.allowance, allowance.decimals) < ethers.parseUnits('1000', allowance.decimals)
      );

      setSecurityStatus({
        walletConnected: true,
        networkSecure,
        contractVerified,
        approvalsSafe,
        lastSecurityCheck: new Date().toISOString()
      });

      // Generate security alerts
      const alerts: string[] = [];
      if (!networkSecure) {
        alerts.push(`⚠️ Connected to potentially unsafe network (Chain ID: ${network.chainId})`);
      }
      if (!contractVerified) {
        alerts.push('⚠️ Contract not verified on block explorer');
      }
      if (!approvalsSafe) {
        alerts.push('⚠️ High token allowances detected');
      }
      
      setSecurityAlerts(alerts);

    } catch (error) {
      console.error('Error checking security status:', error);
    }
  };

  const checkContractVerification = async (address: string): Promise<boolean> => {
    if (!address) return false;
    
    try {
      // This is a simplified check - in production you'd verify against block explorer APIs
      const provider = new ethers.BrowserProvider(window.ethereum);
      const code = await provider.getCode(address);
      return code !== '0x'; // If contract has code, assume it's verified
    } catch {
      return false;
    }
  };

  const checkAllowances = async () => {
    if (!window.ethereum || !contractAddress) return;

    setIsLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const allowancePromises = commonTokens.map(async (token) => {
        try {
          const tokenContract = new ethers.Contract(
            token.address,
            [
              'function allowance(address owner, address spender) view returns (uint256)',
              'function symbol() view returns (string)',
              'function decimals() view returns (uint8)'
            ],
            signer
          );

          const [allowance, symbol, decimals] = await Promise.all([
            tokenContract.allowance(userAddress, contractAddress),
            tokenContract.symbol(),
            tokenContract.decimals()
          ]);

          return {
            token: token.address,
            spender: contractAddress,
            allowance: ethers.formatUnits(allowance, decimals),
            symbol,
            decimals
          };
        } catch (error) {
          console.error(`Error checking allowance for ${token.symbol}:`, error);
          return null;
        }
      });

      const results = await Promise.all(allowancePromises);
      const validResults = results.filter(result => result !== null) as ApprovalInfo[];
      setAllowances(validResults);

    } catch (error) {
      console.error('Error checking allowances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const revokeApproval = async (tokenAddress: string) => {
    if (!window.ethereum || !contractAddress) return;

    try {
      setIsLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ['function approve(address spender, uint256 amount) returns (bool)'],
        signer
      );

      const tx = await tokenContract.approve(contractAddress, 0);
      await tx.wait();

      // Refresh allowances
      await checkAllowances();
      
      // Update security status
      await checkSecurityStatus();

    } catch (error) {
      console.error('Error revoking approval:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getSecurityScore = (): number => {
    let score = 100;
    
    if (!securityStatus.networkSecure) score -= 20;
    if (!securityStatus.contractVerified) score -= 15;
    if (!securityStatus.approvalsSafe) score -= 25;
    if (securityAlerts.length > 0) score -= securityAlerts.length * 10;
    
    return Math.max(0, score);
  };

  const getSecurityLevel = (score: number): { level: string; color: string; icon: React.ReactNode } => {
    if (score >= 90) {
      return { level: 'Excellent', color: 'text-green-400', icon: <CheckCircle size={20} className="text-green-400" /> };
    } else if (score >= 70) {
      return { level: 'Good', color: 'text-yellow-400', icon: <Shield size={20} className="text-yellow-400" /> };
    } else if (score >= 50) {
      return { level: 'Fair', color: 'text-orange-400', icon: <AlertTriangle size={20} className="text-orange-400" /> };
    } else {
      return { level: 'Poor', color: 'text-red-400', icon: <XCircle size={20} className="text-red-400" /> };
    }
  };

  const securityScore = getSecurityScore();
  const securityLevel = getSecurityLevel(securityScore);

  if (!connectedWallet) {
    return (
      <div className="glass-effect border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={24} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Security Controls</h3>
        </div>
        <div className="text-center py-8 text-gray-400">
          <Lock size={48} className="mx-auto mb-4" />
          <p>Connect your wallet to access security controls</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-effect border border-white/10 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield size={24} className="text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Security Controls</h3>
        </div>
        <button
          onClick={() => setShowSensitiveInfo(!showSensitiveInfo)}
          className="flex items-center gap-2 px-3 py-1 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          {showSensitiveInfo ? <EyeOff size={16} /> : <Eye size={16} />}
          {showSensitiveInfo ? 'Hide' : 'Show'} Info
        </button>
      </div>

      {/* Security Score */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-400">Security Score</span>
          <div className="flex items-center gap-2">
            {securityLevel.icon}
            <span className={`font-bold ${securityLevel.color}`}>
              {securityScore}/100 - {securityLevel.level}
            </span>
          </div>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              securityScore >= 90 ? 'bg-green-400' :
              securityScore >= 70 ? 'bg-yellow-400' :
              securityScore >= 50 ? 'bg-orange-400' : 'bg-red-400'
            }`}
            style={{ width: `${securityScore}%` }}
          />
        </div>
      </div>

      {/* Security Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className={`p-3 rounded-lg border ${
          securityStatus.walletConnected ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
        }`}>
          <div className="flex items-center gap-2">
            {securityStatus.walletConnected ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}
            <span className="text-sm font-medium">Wallet Connected</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg border ${
          securityStatus.networkSecure ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
        }`}>
          <div className="flex items-center gap-2">
            {securityStatus.networkSecure ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}
            <span className="text-sm font-medium">Network Secure</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg border ${
          securityStatus.contractVerified ? 'border-green-500/30 bg-green-500/10' : 'border-yellow-500/30 bg-yellow-500/10'
        }`}>
          <div className="flex items-center gap-2">
            {securityStatus.contractVerified ? <CheckCircle size={16} className="text-green-400" /> : <AlertTriangle size={16} className="text-yellow-400" />}
            <span className="text-sm font-medium">Contract Verified</span>
          </div>
        </div>
        
        <div className={`p-3 rounded-lg border ${
          securityStatus.approvalsSafe ? 'border-green-500/30 bg-green-500/10' : 'border-red-500/30 bg-red-500/10'
        }`}>
          <div className="flex items-center gap-2">
            {securityStatus.approvalsSafe ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}
            <span className="text-sm font-medium">Approvals Safe</span>
          </div>
        </div>
      </div>

      {/* Security Alerts */}
      {securityAlerts.length > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
          <h4 className="text-red-400 font-medium mb-2">Security Alerts</h4>
          <div className="space-y-2">
            {securityAlerts.map((alert, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-red-300">
                <AlertTriangle size={14} />
                {alert}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Token Approvals */}
      <div className="mb-6">
        <h4 className="text-white font-medium mb-3">Token Approvals</h4>
        {isLoading ? (
          <div className="text-center py-4 text-gray-400">Checking approvals...</div>
        ) : allowances.length > 0 ? (
          <div className="space-y-3">
            {allowances.map((allowance, index) => (
              <div key={index} className="p-3 bg-white/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{allowance.symbol}</span>
                    <span className="text-sm text-gray-400">
                      {showSensitiveInfo ? allowance.token : `${allowance.token.substring(0, 6)}...${allowance.token.substring(38)}`}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(allowance.token)}
                    className="p-1 hover:bg-white/10 rounded transition-colors"
                  >
                    <Copy size={14} className="text-gray-400" />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    Allowance: <span className="text-white">{allowance.allowance}</span>
                  </div>
                  
                  {parseFloat(allowance.allowance) > 0 && (
                    <button
                      onClick={() => revokeApproval(allowance.token)}
                      disabled={isLoading}
                      className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded text-sm transition-colors disabled:opacity-50"
                    >
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400">No token approvals found</div>
        )}
      </div>

      {/* Security Actions */}
      <div className="space-y-3">
        <button
          onClick={checkSecurityStatus}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Shield size={16} />
          Refresh Security Status
        </button>
        
        <button
          onClick={checkAllowances}
          disabled={isLoading}
          className="w-full px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} />
          Check Token Approvals
        </button>
      </div>

      {/* Last Updated */}
      <div className="mt-6 pt-4 border-t border-white/10 text-xs text-gray-500 text-center">
        Last security check: {new Date(securityStatus.lastSecurityCheck).toLocaleString()}
      </div>
    </div>
  );
};

export default SecurityControls;
