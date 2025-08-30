import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AegisSecurityProvider } from './contexts/AegisSecurityContext';
import TransactionStatusBanner from './components/TransactionStatusBanner';
import { WalletProvider } from './contexts/WalletContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import AppWelcome from './components/AppWelcome';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import MultiChainDashboard from './components/MultiChainDashboard';
import Deposit from './pages/Deposit';
import Borrow from './pages/Borrow';
import Loans from './pages/Loans';
import NftCollateral from './pages/NftCollateral';
import Analytics from './pages/Analytics';
import Governance from './pages/Governance';
import AITest from './pages/AITest';
import SimpleAITest from './components/SimpleAITest';
import IconTest from './components/IconTest';
import ChartTest from './components/ChartTest';
import SimpleWalletTest from './components/SimpleWalletTest';
import RevenueDashboard from './pages/RevenueDashboard';
import VibeTradingAIPage from './pages/VibeTradingAI';
import AegisSecurityPage from './pages/AegisSecurity';

import NotFound from './pages/NotFound';

// Global Error Boundary Component
class GlobalErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Global Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 to-pink-900 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center max-w-2xl">
            <h1 className="text-3xl font-bold text-white mb-4">🚨 Application Error</h1>
            <p className="text-red-200 mb-6">
              Something went wrong with the application. This might be due to:
            </p>
            <ul className="text-red-200 text-left mb-6 space-y-2">
              <li>• Missing environment variables</li>
              <li>• Wallet connection issues</li>
              <li>• Component rendering errors</li>
              <li>• Network connectivity problems</li>
            </ul>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Reload Application
              </button>
              <div className="text-xs text-red-300">
                Error: {this.state.error?.message || 'Unknown error'}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// App Routes component that can access router context
const AppRoutes = () => {
  const location = useLocation();
  
  return (
    <>
      {/* Only show TransactionStatusBanner when NOT on landing page */}
      {location.pathname !== '/' && <TransactionStatusBanner />}
      
      <Routes>
        {/* Landing page - no layout wrapper */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Simple Test Route */}
        <Route path="/simple-test" element={<SimpleAITest />} />
        
        {/* AI Test Route */}
        <Route path="/ai-test" element={<AITest />} />
        
        {/* Icon Test Route */}
        <Route path="/icon-test" element={<IconTest />} />
        
        {/* Chart Test Route */}
        <Route path="/chart-test" element={<ChartTest />} />
        
        {/* Wallet Test Route */}
        <Route path="/wallet-test" element={<SimpleWalletTest />} />
        
        {/* Revenue Dashboard Route */}
        <Route path="/revenue" element={<RevenueDashboard />} />
        
        {/* Vibe Trading AI Route */}
        <Route path="/vibe-trading" element={<VibeTradingAIPage />} />
        
        {/* AEGIS Security Route */}
        <Route path="/aegis-security" element={<AegisSecurityPage />} />
        
        {/* Protected routes with layout wrapper */}
        <Route path="/app" element={<Layout />}>
          <Route index element={<AppWelcome />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="multi-chain" element={<MultiChainDashboard />} />
          <Route path="deposit" element={<Deposit />} />
          <Route path="borrow" element={<Borrow />} />
          <Route path="loans" element={<Loans />} />
          <Route path="nft-collateral" element={<NftCollateral />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="governance" element={<Governance />} />
        </Route>
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <GlobalErrorBoundary>
      <AegisSecurityProvider>
        <WalletProvider>
          <NotificationProvider>
            <Router>
              <AppRoutes />
            </Router>
          </NotificationProvider>
        </WalletProvider>
      </AegisSecurityProvider>
    </GlobalErrorBoundary>
  );
};

export default App;