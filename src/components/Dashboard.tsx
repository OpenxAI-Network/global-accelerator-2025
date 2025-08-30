import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, DollarSign, Shield, Zap, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DashboardProps {
  portfolioData: any;
  loanHealth: any;
  chainData: any[];
}

const CHAIN_COLORS = {
  bitcoin: '#f7931a',
  ethereum: '#627eea',
  solana: '#9945ff',
  polygon: '#8247e5',
  avalanche: '#e84142',
  base: '#0052ff'
};

export default function Dashboard({ portfolioData, loanHealth, chainData }: DashboardProps) {
  // Mock data for demonstration
  const mockPortfolioData = {
    totalCollateral: 125000,
    totalBorrowed: 75000,
    availableCredit: 50000,
    netWorth: 50000,
    ltvRatio: 60
  };

  const mockLoanHealth = {
    status: 'healthy',
    riskLevel: 'low',
    liquidationPrice: 42000,
    nextAlert: 45000
  };

  const mockChainData = [
    { name: 'Bitcoin', value: 45000, percentage: 36, color: CHAIN_COLORS.bitcoin },
    { name: 'Ethereum', value: 32000, percentage: 26, color: CHAIN_COLORS.ethereum },
    { name: 'Solana', value: 25000, percentage: 20, color: CHAIN_COLORS.solana },
    { name: 'Base', value: 15000, percentage: 12, color: CHAIN_COLORS.base },
    { name: 'Avalanche', value: 8000, percentage: 6, color: CHAIN_COLORS.avalanche }
  ];

  const mockPriceHistory = [
    { time: '00:00', value: 120000 },
    { time: '04:00', value: 122000 },
    { time: '08:00', value: 125000 },
    { time: '12:00', value: 123000 },
    { time: '16:00', value: 125000 },
    { time: '20:00', value: 124000 },
    { time: '24:00', value: 125000 }
  ];

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getHealthBadgeVariant = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'warning': return 'secondary';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collateral</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockPortfolioData.totalCollateral.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.5% from last week
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Borrowed</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockPortfolioData.totalBorrowed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              LTV: {mockPortfolioData.ltvRatio}%
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Credit</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockPortfolioData.availableCredit.toLocaleString()}</div>
            <p className="text-xs text-success flex items-center">
              Ready to borrow across chains
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${mockPortfolioData.netWorth.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              After all loans
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Chart */}
        <Card className="lg:col-span-2 glass-effect">
          <CardHeader>
            <CardTitle>Portfolio Value (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={mockPriceHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chain Distribution */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Asset Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={mockChainData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                >
                  {mockChainData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`$${value.toLocaleString()}`, 'Value']}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {mockChainData.map((chain) => (
                <div key={chain.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="h-3 w-3 rounded-full" 
                      style={{ backgroundColor: chain.color }}
                    />
                    <span>{chain.name}</span>
                  </div>
                  <span className="font-medium">{chain.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loan Health Status */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Loan Health Status
            <Badge variant={getHealthBadgeVariant(mockLoanHealth.status)}>
              {mockLoanHealth.status.toUpperCase()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Risk Level</p>
              <p className={`text-lg font-semibold ${getHealthColor(mockLoanHealth.status)}`}>
                {mockLoanHealth.riskLevel.toUpperCase()}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Liquidation Price</p>
              <p className="text-lg font-semibold">${mockLoanHealth.liquidationPrice.toLocaleString()}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Next Alert</p>
              <p className="text-lg font-semibold">${mockLoanHealth.nextAlert.toLocaleString()}</p>
            </div>
          </div>
          
          {mockLoanHealth.status !== 'healthy' && (
            <div className="mt-4 p-4 rounded-lg bg-warning/10 border border-warning/20 flex items-center space-x-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium text-warning-foreground">Risk Alert</p>
                <p className="text-sm text-muted-foreground">
                  Your position is approaching liquidation. Consider adding collateral or repaying loans.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}