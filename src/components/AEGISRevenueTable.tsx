import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Shield, Database, Code, Users, BarChart3 } from 'lucide-react';

interface RevenueStream {
  id: string;
  stream: string;
  model: string;
  impact: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  projectedMonthly: string;
  projectedYearly: string;
  growthRate: string;
}

const AEGISRevenueTable: React.FC = () => {
  const [revenueStreams, setRevenueStreams] = useState<RevenueStream[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProjectedRevenue, setTotalProjectedRevenue] = useState('$0');

  useEffect(() => {
    // Simulate API call - replace with actual API endpoint
    const fetchRevenueData = async () => {
      try {
        // Mock data - replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const streams: RevenueStream[] = [
          {
            id: 'loan-origination',
            stream: 'Loan Origination Fees',
            model: '0.75% of all originations',
            impact: '$150K/month @ $20M vol',
            description: 'Fee charged when new cross-chain loans are opened on AEGIS',
            icon: <TrendingUp className="w-5 h-5" />,
            color: 'bg-green-500',
            projectedMonthly: '$150,000',
            projectedYearly: '$1,800,000',
            growthRate: '+15%'
          },
          {
            id: 'liquidation-premium',
            stream: 'Liquidation & Security Fees',
            model: '8% of liquidated collateral',
            impact: '$25K/month (avg 3/day)',
            description: 'Premium collected when unhealthy positions are liquidated',
            icon: <Shield className="w-5 h-5" />,
            color: 'bg-red-500',
            projectedMonthly: '$25,000',
            projectedYearly: '$300,000',
            growthRate: '+8%'
          },
          {
            id: 'yield-margin',
            stream: 'Yield Sharing / Interest Margin',
            model: '0.5–1% of lent assets',
            impact: '$50K+/month @ $10M TVL',
            description: 'Protocol fee on managed, auto-rebalanced, or AI-optimized lending pools',
            icon: <DollarSign className="w-5 h-5" />,
            color: 'bg-blue-500',
            projectedMonthly: '$75,000',
            projectedYearly: '$900,000',
            growthRate: '+25%'
          },
          {
            id: 'api-licensing',
            stream: 'API SaaS & White-Labeling',
            model: '$2–10K/month per client',
            impact: '$20–50K/month, grows w/ integrations',
            description: 'Exchanges, wallets, and DAOs integrate AEGIS AI risk engine',
            icon: <Code className="w-5 h-5" />,
            color: 'bg-purple-500',
            projectedMonthly: '$35,000',
            projectedYearly: '$420,000',
            growthRate: '+40%'
          },
          {
            id: 'premium-security',
            stream: 'Premium Security Automation',
            model: 'Tiered feature pricing',
            impact: '$10–30K/month (institutions)',
            description: 'Advanced features like AI threat monitoring and compliance reporting',
            icon: <Shield className="w-5 h-5" />,
            color: 'bg-yellow-500',
            projectedMonthly: '$20,000',
            projectedYearly: '$240,000',
            growthRate: '+20%'
          },
          {
            id: 'token-utility',
            stream: 'Token Fees & Governance',
            model: 'AEGIS token utility',
            impact: 'Variable; launched post-development',
            description: 'Token used for protocol fees, governance, and staking rewards',
            icon: <Users className="w-5 h-5" />,
            color: 'bg-indigo-500',
            projectedMonthly: '$15,000',
            projectedYearly: '$180,000',
            growthRate: '+60%'
          },
          {
            id: 'data-syndication',
            stream: 'Data/Analytics as a Service',
            model: 'Sell security/analytics data',
            impact: '$5–20K/month',
            description: 'Real-time risk data and cross-chain security analytics',
            icon: <Database className="w-5 h-5" />,
            color: 'bg-pink-500',
            projectedMonthly: '$12,500',
            projectedYearly: '$150,000',
            growthRate: '+30%'
          }
        ];

        setRevenueStreams(streams);
        
        // Calculate total projected revenue
        const total = streams.reduce((sum, stream) => {
          const monthly = parseFloat(stream.projectedMonthly.replace(/[$,]/g, ''));
          return sum + monthly;
        }, 0);
        
        setTotalProjectedRevenue(`$${(total / 1000).toFixed(1)}K`);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching revenue data:', error);
        setIsLoading(false);
      }
    };

    fetchRevenueData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-xl p-8 border border-white/20">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4 flex items-center justify-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-400" />
          AEGIS Protocol: Revenue & Monetization Model
        </h2>
        <p className="text-gray-300 text-lg">
          Sustainable, scalable, and innovation-driven revenue streams
        </p>
      </div>

      {/* Revenue Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Monthly</p>
              <p className="text-2xl font-bold text-white">{totalProjectedRevenue}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Annual Projection</p>
              <p className="text-2xl font-bold text-white">$4.0M</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Revenue Streams</p>
              <p className="text-2xl font-bold text-white">7</p>
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-400">Growth Rate</p>
              <p className="text-2xl font-bold text-white">+25%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Streams Table */}
      <div className="bg-white/5 backdrop-blur-lg rounded-lg border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-white/10 border-b border-white/20">
                <th className="text-left p-4 text-white font-semibold">Revenue Stream</th>
                <th className="text-left p-4 text-white font-semibold">Business Model</th>
                <th className="text-left p-4 text-white font-semibold">Monthly Projection</th>
                <th className="text-left p-4 text-white font-semibold">Annual Projection</th>
                <th className="text-left p-4 text-white font-semibold">Growth</th>
              </tr>
            </thead>
            <tbody>
              {revenueStreams.map((stream, index) => (
                <tr 
                  key={stream.id} 
                  className={`border-b border-white/10 transition-colors hover:bg-white/5 ${
                    index % 2 === 0 ? 'bg-white/5' : 'bg-transparent'
                  }`}
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 ${stream.color} rounded-lg flex items-center justify-center`}>
                        {stream.icon}
                      </div>
                      <div>
                        <div className="font-medium text-white">{stream.stream}</div>
                        <div className="text-sm text-gray-400 max-w-xs">{stream.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-white font-medium">{stream.model}</div>
                    <div className="text-sm text-gray-400">{stream.impact}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-green-400 font-bold text-lg">{stream.projectedMonthly}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-blue-400 font-semibold">{stream.projectedYearly}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-semibold">{stream.growthRate}</span>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-lg p-6 border border-green-500/30">
          <h3 className="text-lg font-semibold text-green-400 mb-3">Sustainable Revenue</h3>
          <p className="text-gray-300 text-sm">
            Revenue linked to volume, security, and premium features—not speculation alone
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-lg p-6 border border-blue-500/30">
                          <h3 className="text-lg font-semibold text-blue-400 mb-3">Cross-Chain Aligned</h3>
          <p className="text-gray-300 text-sm">
            Leverages cross-chain transaction volume and universal contract usage
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-lg p-6 border border-purple-500/30">
          <h3 className="text-lg font-semibold text-purple-400 mb-3">Scalable Model</h3>
          <p className="text-gray-300 text-sm">
            Monetizes both DeFi and institutional/enterprise markets
          </p>
        </div>
      </div>

      {/* Call to Action */}
      <div className="mt-8 text-center">
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg p-6 border border-blue-500/30">
          <h3 className="text-xl font-semibold text-white mb-3">
            Ready for Production Deployment
          </h3>
          <p className="text-gray-300 mb-4">
            AEGIS monetizes cross-chain security and lending at every layer—from borrower and lender activity 
            to API, institutional, and data/analytics services.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <span className="text-white font-medium">Total Monthly Revenue: {totalProjectedRevenue}</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <span className="text-white font-medium">Annual Projection: $4.0M</span>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-lg">
              <span className="text-white font-medium">Growth Rate: +25%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AEGISRevenueTable;
