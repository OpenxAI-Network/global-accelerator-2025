import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Shield,
  Wallet, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  Bell,
  User,
  Brain,
  Globe,
  AlertTriangle,
  BookOpen,
  Network,
  CheckCircle,
  Copy,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import WalletConnect from './WalletConnect';
import WalletConnectionModal from './WalletConnectionModal';
import NotificationPanel from './NotificationPanel';
import BlockchainSwitcher from './BlockchainSwitcher';
import { useWallet } from '../contexts/WalletContext';
import { getBlockchainByChainId } from '../config/blockchains';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [hasShownWalletModal, setHasShownWalletModal] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [zetaNetwork, setZetaNetwork] = useState<'mainnet' | 'testnet'>('mainnet');
  const [walletInfoOpen, setWalletInfoOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected, address, network, isDemoMode, currentBlockchain, chainId } = useWallet();

  // Load sidebar preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('aegis-sidebar-collapsed');
    if (savedPreference !== null) {
      setSidebarCollapsed(JSON.parse(savedPreference));
    }
  }, []);

  // Save sidebar preference to localStorage
  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('aegis-sidebar-collapsed', JSON.stringify(newState));
  };

  // Keyboard shortcut to toggle sidebar (Ctrl+B or Cmd+B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed]);

  const navigation = [
    { name: 'Multi-Chain', href: '/app/multi-chain', icon: Globe, current: location.pathname === '/app/multi-chain' },
    { name: 'Deposit', href: '/app/deposit', icon: Wallet, current: location.pathname === '/app/deposit' },
    { name: 'Borrow', href: '/app/borrow', icon: DollarSign, current: location.pathname === '/app/borrow' },
    { name: 'Loans', href: '/app/loans', icon: FileText, current: location.pathname === '/app/loans' },
    { name: 'NFT Collateral', href: '/app/nft-collateral', icon: TrendingUp, current: location.pathname === '/app/nft-collateral' },
    { name: 'Analytics', href: '/app/analytics', icon: BarChart3, current: location.pathname === '/app/analytics' },
    { name: 'Governance', href: '/app/governance', icon: Settings, current: location.pathname === '/app/governance' },
  ];

  const aiNavigation = [
    { name: 'Vibe Trading AI', href: '/vibe-trading', icon: Brain, current: location.pathname === '/vibe-trading' },
    { name: 'Security Center', href: '/aegis-security', icon: AlertTriangle, current: location.pathname === '/aegis-security' },
  ];

  const handleNavigation = (href: string) => {
    navigate(href);
    setSidebarOpen(false);
  };

  // Auto-close wallet modal when wallet connects
  useEffect(() => {
    if (isConnected && walletModalOpen) {
      setWalletModalOpen(false);
    }
  }, [isConnected, walletModalOpen]);

  if (!isConnected && !isDemoMode) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
          <div className="text-center max-w-md mx-4">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-foreground">Welcome to Aegis</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              The next-generation multi-chain lending platform. Connect your wallet to access 
              lending, borrowing, and DeFi opportunities across multiple blockchains.
            </p>
            <button
              onClick={() => {
                setWalletModalOpen(true);
                setHasShownWalletModal(true);
              }}
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-colors shadow-lg hover:shadow-xl"
            >
              Connect Wallet
            </button>
          </div>
        </div>
        <WalletConnectionModal 
          isOpen={walletModalOpen && !isConnected} 
          onClose={() => setWalletModalOpen(false)} 
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-darker to-dark text-white">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-800/95 backdrop-blur-xl border-r border-white/10 shadow-2xl transform transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } ${
        sidebarCollapsed ? 'w-16 lg:translate-x-0' : 'w-64 lg:translate-x-0'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between h-12 px-3 border-b border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              <Shield size={16} className="text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="text-base font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AEGIS
                </span>
                <span className="text-xs text-gray-400 font-medium tracking-wide">
                  Cross-Chain Lending
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
                          <button
                onClick={toggleSidebar}
                className="hidden lg:flex p-1 rounded-lg hover:bg-white/10 transition-colors"
                title={`${sidebarCollapsed ? "Expand" : "Collapse"} Sidebar (Ctrl+B)`}
              >
              {sidebarCollapsed ? (
                <ChevronRight size={16} className="text-gray-400" />
              ) : (
                <ChevronLeft size={16} className="text-gray-400" />
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        {/* Blockchain Switcher */}
        {!sidebarCollapsed && (
          <div className="px-3 py-1">
            <BlockchainSwitcher 
              currentBlockchain={currentBlockchain}
              variant="sidebar"
              showTestnets={true}
            />
          </div>
        )}

        {/* Main Navigation */}
        <div className="px-3 py-1">
          {!sidebarCollapsed && (
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2">
              Core Features
            </div>
          )}
          <nav className="space-y-0.5">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.current
                    ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-blue-500/30 shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white hover:shadow-md'
                }`}
              >
                <div className={`p-1 rounded-lg ${
                  item.current 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                    : 'bg-gray-700/50 text-gray-400'
                }`}>
                  <item.icon size={14} />
                </div>
                {!sidebarCollapsed && item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* AI & Security Navigation */}
        <div className="px-3 py-1 mt-1">
          {!sidebarCollapsed && (
            <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 px-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
              AI & Security
            </div>
          )}
          <nav className="space-y-0.5">
            {aiNavigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  item.current
                    ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border border-purple-500/30 shadow-lg'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white hover:shadow-md'
                }`}
              >
                <div className={`p-1 rounded-lg ${
                  item.current 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-gray-700/50 text-gray-400'
                }`}>
                  <item.icon size={14} />
                </div>
                {!sidebarCollapsed && item.name}
              </button>
            ))}
          </nav>
        </div>

        {/* User section at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-white/10 bg-gradient-to-r from-gray-800/50 to-gray-700/50">
          {!isConnected ? (
            <button 
              onClick={() => setWalletModalOpen(true)}
              className={`flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-200 border border-blue-500/30 hover:border-blue-500/50 ${
                sidebarCollapsed ? 'justify-center w-full' : 'w-full'
              }`}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Wallet size={14} className="text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate">
                    Connect Wallet
                  </p>
                  <p className="text-xs text-blue-200 truncate">
                    Click to connect your wallet
                  </p>
                </div>
              )}
            </button>
          ) : (
            <button 
              onClick={() => setWalletInfoOpen(true)}
              className={`flex items-center gap-2 p-2 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-200 border border-green-500/30 hover:border-green-500/50 ${
                sidebarCollapsed ? 'justify-center w-full' : 'w-full'
              }`}
            >
              <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                <Wallet size={14} className="text-white" />
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate">
                    {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Connected Wallet'}
                  </p>
                  <p className="text-xs text-green-200 truncate">
                    {network || 'Ethereum'} • Connected
                </p>
              </div>
            )}
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className={`transition-all duration-300 ease-in-out ${
        sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
      }`}>
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-gray-900/80 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              >
                <Menu size={20} />
              </button>
              <button
                onClick={toggleSidebar}
                className="hidden lg:flex p-2 rounded-lg hover:bg-white/10 transition-colors"
                title={`${sidebarCollapsed ? "Expand" : "Collapse"} Sidebar (Ctrl+B)`}
              >
                {sidebarCollapsed ? (
                  <ChevronRight size={20} />
                ) : (
                  <ChevronLeft size={20} />
                )}
              </button>
              <div className="hidden lg:block">
                <h1 className="text-lg font-semibold text-white">
                  {location.pathname === '/app' && 'Welcome'}
                  {location.pathname === '/app/dashboard' && 'Dashboard'}
                  {location.pathname === '/app/multi-chain' && 'Multi-Chain Dashboard'}
                  {location.pathname === '/app/deposit' && 'Deposit'}
                  {location.pathname === '/app/borrow' && 'Borrow'}
                  {location.pathname === '/app/loans' && 'Loans'}
                  {location.pathname === '/app/nft-collateral' && 'NFT Collateral'}
                  {location.pathname === '/app/analytics' && 'Analytics'}
                  {location.pathname === '/app/governance' && 'Governance'}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <WalletConnect />
              <button
                onClick={() => setNotificationPanelOpen(true)}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Modals */}
      <WalletConnectionModal 
        isOpen={walletModalOpen} 
        onClose={() => setWalletModalOpen(false)} 
      />
      
      <NotificationPanel 
        isOpen={notificationPanelOpen}
        onClose={() => setNotificationPanelOpen(false)}
      />
    </div>
  );
};

export default Layout;
