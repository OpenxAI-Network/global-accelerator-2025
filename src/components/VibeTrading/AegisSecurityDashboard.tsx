'use client';

import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity, Globe, Users, TrendingUp } from 'lucide-react';

interface SecurityAlert {
  id: string;
  type: string;
  chain: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  status: string;
  acknowledged: boolean;
  resolved: boolean;
}

interface UserSecurityStatus {
  userId: string;
  riskScore: number;
  threatCount: number;
  lastThreat: string;
  securityLevel: string;
  recommendations: string[];
}

export default function AegisSecurityDashboard() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [userStatus, setUserStatus] = useState<UserSecurityStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'users' | 'threats'>('overview');

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch cross-chain alerts
      const alertsResponse = await fetch('/api/aegis/cross-chain-alert?limit=20');
      const alertsData = await alertsResponse.json();
      
      if (alertsData.success) {
        setAlerts(alertsData.data.alerts);
      }
      
      // Fetch user security status
      const userResponse = await fetch('/api/aegis/user-status');
      const userData = await userResponse.json();
      
      if (userData.success) {
        setUserStatus(userData.data);
      }
      
    } catch (error) {
      console.error('Failed to fetch security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4" />;
      case 'high': return <AlertTriangle className="w-4 h-4" />;
      case 'medium': return <AlertTriangle className="w-4 h-4" />;
      case 'low': return <CheckCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getRiskLevelColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  if (isLoading) {
    return (
      <div className="bg-white/5 rounded-lg p-6 border border-white/20">
        <div className="flex items-center justify-center h-32">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="text-center text-blue-200">Loading AEGIS security dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-bold text-white">AEGIS Security Dashboard</h3>
        </div>
        <button
          onClick={fetchSecurityData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: <Shield className="w-4 h-4" /> },
          { id: 'alerts', label: 'Alerts', icon: <AlertTriangle className="w-4 h-4" /> },
          { id: 'users', label: 'Users', icon: <Users className="w-4 h-4" /> },
          { id: 'threats', label: 'Threats', icon: <Activity className="w-4 h-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Security Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {alerts.filter(a => a.severity === 'critical' || a.severity === 'high').length}
                    </div>
                    <div className="text-sm text-gray-400">High Priority Alerts</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {alerts.filter(a => a.resolved).length}
                    </div>
                    <div className="text-sm text-gray-400">Resolved Issues</div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-white">
                      {new Set(alerts.map(a => a.chain)).size}
                    </div>
                    <div className="text-sm text-gray-400">Chains Monitored</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/20">
              <h4 className="text-white font-medium mb-3">Recent Security Activity</h4>
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center gap-3 p-2 bg-white/5 rounded">
                    {getSeverityIcon(alert.severity)}
                    <div className="flex-1">
                      <div className="text-white text-sm font-medium">{alert.title}</div>
                      <div className="text-gray-400 text-xs">{alert.chain} • {new Date(alert.timestamp).toLocaleString()}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-white font-medium">Cross-Chain Security Alerts</h4>
              <div className="text-sm text-gray-400">
                {alerts.length} total alerts
              </div>
            </div>
            
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="bg-white/5 rounded-lg p-4 border border-white/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(alert.severity)}
                      <div>
                        <div className="text-white font-medium">{alert.title}</div>
                        <div className="text-gray-400 text-sm">{alert.chain} • {alert.type}</div>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </div>
                  </div>
                  
                  <div className="text-gray-300 text-sm mb-3">{alert.description}</div>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(alert.timestamp).toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded ${
                        alert.status === 'active' ? 'bg-red-500/20 text-red-400' :
                        alert.status === 'acknowledged' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {alert.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            {userStatus && (
              <div className="bg-white/5 rounded-lg p-4 border border-white/20">
                <h4 className="text-white font-medium mb-4">User Security Profile</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-1">Risk Score</div>
                    <div className={`text-2xl font-bold ${getRiskLevelColor(userStatus.riskScore)}`}>
                      {userStatus.riskScore}/100
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-lg p-3">
                    <div className="text-sm text-gray-400 mb-1">Threat Count</div>
                    <div className="text-2xl font-bold text-white">
                      {userStatus.threatCount}
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <div className="text-sm text-gray-400 mb-2">Security Level</div>
                  <div className="text-white font-medium capitalize">{userStatus.securityLevel}</div>
                </div>
                
                <div className="bg-white/5 rounded-lg p-3">
                  <div className="text-sm text-gray-400 mb-2">Recommendations</div>
                  <ul className="space-y-1">
                    {userStatus.recommendations.map((rec, index) => (
                      <li key={index} className="text-white text-sm flex items-start gap-2">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 flex-shrink-0"></span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'threats' && (
          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4 border border-white/20">
              <h4 className="text-white font-medium mb-4">Threat Analysis</h4>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-white font-medium">Critical Threats</div>
                      <div className="text-gray-400 text-sm">Immediate action required</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-400">
                    {alerts.filter(a => a.severity === 'critical').length}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <div>
                      <div className="text-white font-medium">High Priority</div>
                      <div className="text-gray-400 text-sm">Investigation needed</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-400">
                    {alerts.filter(a => a.severity === 'high').length}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-white/5 rounded">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-white font-medium">Medium Risk</div>
                      <div className="text-gray-400 text-sm">Monitor closely</div>
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">
                    {alerts.filter(a => a.severity === 'medium').length}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
