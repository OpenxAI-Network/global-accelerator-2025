'use client';

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity, Settings } from 'lucide-react';
import { useAegisSecurity } from '../contexts/AegisSecurityContext';

export default function SecurityNavigation() {
  const location = useLocation();
  const { securityStatus, getSecuritySummary } = useAegisSecurity();
  const securitySummary = getSecuritySummary();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'secure': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'secure': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <Shield className="w-4 h-4 text-gray-400" />;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white/5 backdrop-blur-sm border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">AEGIS</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Home
            </Link>
            
            <Link
              to="/vibe-trading"
              className={`text-sm font-medium transition-colors ${
                isActive('/vibe-trading') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Vibe Trading AI
            </Link>
            
            <Link
              to="/aegis-security"
              className={`text-sm font-medium transition-colors ${
                isActive('/aegis-security') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Security Center
            </Link>
            
            <Link
              to="/app/dashboard"
              className={`text-sm font-medium transition-colors ${
                isActive('/app/dashboard') ? 'text-white' : 'text-gray-300 hover:text-white'
              }`}
            >
              Dashboard
            </Link>
          </div>

          {/* Security Status and Quick Actions */}
          <div className="flex items-center gap-4">
            {/* Security Status Indicator */}
            <Link
              to="/aegis-security"
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              {getStatusIcon(securityStatus)}
              <span className={`text-sm font-medium ${getStatusColor(securityStatus)}`}>
                {securityStatus.toUpperCase()}
              </span>
            </Link>

            {/* Active Threats Counter */}
            {securitySummary.totalThreats > 0 && (
              <Link
                to="/aegis-security"
                className="flex items-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors"
              >
                <Activity className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">
                  {securitySummary.totalThreats} Threats
                </span>
              </Link>
            )}

            {/* Settings */}
            <Link
              to="/app/settings"
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-300" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
