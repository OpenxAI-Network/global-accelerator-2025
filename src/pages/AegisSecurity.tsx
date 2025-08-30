import React from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Activity, Settings, History, Users } from 'lucide-react';
import { useAegisSecurity } from '../contexts/AegisSecurityContext';

export default function AegisSecurity() {
  const { 
    activeThreats, 
    securityStatus, 
    getSecuritySummary, 
    resolveThreat, 
    clearThreats 
  } = useAegisSecurity();

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
      case 'secure': return <CheckCircle className="w-6 h-6 text-green-400" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'critical': return <XCircle className="w-6 h-6 text-red-400" />;
      default: return <Shield className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      {/* Global Security Alert */}
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">AEGIS Security Center</h1>
              <p className="text-blue-200 text-lg">
                Comprehensive security monitoring and threat management for your DeFi operations
              </p>
            </div>
          </div>

          {/* Security Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-4">
                {getStatusIcon(securityStatus)}
                <div>
                  <div className="text-2xl font-bold text-white capitalize">{securityStatus}</div>
                  <div className="text-blue-200 text-sm">System Status</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{securitySummary.totalThreats}</div>
                  <div className="text-blue-200 text-sm">Total Threats</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{securitySummary.criticalThreats}</div>
                  <div className="text-blue-200 text-sm">Critical</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-6 border border-white/20">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{securitySummary.resolvedThreats}</div>
                  <div className="text-blue-200 text-sm">Resolved</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Threats Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <Activity className="w-6 h-6 text-blue-400" />
                  Active Security Threats
                </h2>
                <button
                  onClick={clearThreats}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                >
                  Clear All
                </button>
              </div>

              {activeThreats.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                  <div className="text-white text-xl font-medium mb-2">All Clear!</div>
                  <div className="text-blue-200">No active security threats detected</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeThreats.map((threat) => (
                    <div
                      key={threat.id}
                      className={`p-4 rounded-lg border ${
                        threat.severity === 'critical' ? 'bg-red-500/20 border-red-500/30' :
                        threat.severity === 'high' ? 'bg-orange-500/20 border-orange-500/30' :
                        threat.severity === 'medium' ? 'bg-yellow-500/20 border-yellow-500/30' :
                        'bg-blue-500/20 border-blue-500/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              threat.severity === 'critical' ? 'bg-red-500 text-white' :
                              threat.severity === 'high' ? 'bg-orange-500 text-white' :
                              threat.severity === 'medium' ? 'bg-yellow-500 text-white' :
                              'bg-blue-500 text-white'
                            }`}>
                              {threat.severity.toUpperCase()}
                            </span>
                            {threat.chain && (
                              <span className="text-xs text-blue-200 bg-blue-500/20 px-2 py-1 rounded">
                                {threat.chain}
                              </span>
                            )}
                          </div>
                          <div className="text-white font-medium mb-1">{threat.message}</div>
                          <div className="text-blue-200 text-sm">
                            {new Date(threat.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <button
                          onClick={() => resolveThreat(threat.id)}
                          className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded text-sm transition-colors"
                        >
                          Resolve
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Security Controls Panel */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Settings className="w-5 h-5 text-blue-400" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors">
                  🔒 Lock Account
                </button>
                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg transition-colors">
                  🚫 Freeze Assets
                </button>
                <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg transition-colors">
                  📊 Security Report
                </button>
                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors">
                  ✅ Verify Identity
                </button>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Settings className="w-5 h-5 text-blue-400" />
                Security Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">2FA Authentication</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Email Notifications</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">SMS Alerts</span>
                  <div className="w-12 h-6 bg-gray-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-200">Auto-Lock</span>
                  <div className="w-12 h-6 bg-green-500 rounded-full relative">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Profile */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                Risk Profile
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-blue-200">Risk Score</span>
                    <span className="text-white">75/100</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="text-sm text-blue-200">
                  <div>• Account Age: 45 days</div>
                  <div>• Verification: Level 2</div>
                  <div>• Trading Volume: $12,450</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
