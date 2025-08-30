import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDownUp, Coins, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface LendingInterfaceProps {
  onBorrow: (amount: number, asset: string, collateral: string) => void;
  onRepay: (amount: number, asset: string) => void;
  availableAssets: any[];
  chainData: any[];
}

const SUPPORTED_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', chain: 'Bitcoin', icon: '₿', apy: '5.2%' },
  { symbol: 'ETH', name: 'Ethereum', chain: 'Ethereum', icon: 'Ξ', apy: '4.8%' },
  { symbol: 'SOL', name: 'Solana', chain: 'Solana', icon: '◎', apy: '6.1%' },
  { symbol: 'USDC', name: 'USD Coin', chain: 'Base', icon: '$', apy: '3.5%' },
  { symbol: 'ZETA', name: 'ZetaChain', chain: 'ZetaChain', icon: 'Z', apy: '7.2%' },
  { symbol: 'AVAX', name: 'Avalanche', chain: 'Avalanche', icon: '🔺', apy: '5.8%' }
];

const NFT_COLLECTIONS = [
  { name: 'Bored Ape Yacht Club', floor: '12.5 ETH', chain: 'Ethereum' },
  { name: 'Azuki', floor: '3.2 ETH', chain: 'Ethereum' },
  { name: 'DeGods', floor: '145 SOL', chain: 'Solana' },
  { name: 'Pudgy Penguins', floor: '8.1 ETH', chain: 'Ethereum' }
];

export default function LendingInterface({ onBorrow, onRepay, availableAssets, chainData }: LendingInterfaceProps) {
  const [borrowAmount, setBorrowAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [selectedCollateral, setSelectedCollateral] = useState('');
  const [selectedBorrowAsset, setSelectedBorrowAsset] = useState('');
  const [selectedRepayAsset, setSelectedRepayAsset] = useState('');
  const [borrowChain, setBorrowChain] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBorrow = async () => {
    if (!borrowAmount || !selectedBorrowAsset || !selectedCollateral) return;
    
    setIsProcessing(true);
    try {
      await onBorrow(parseFloat(borrowAmount), selectedBorrowAsset, selectedCollateral);
      setBorrowAmount('');
      setSelectedBorrowAsset('');
      setSelectedCollateral('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRepay = async () => {
    if (!repayAmount || !selectedRepayAsset) return;
    
    setIsProcessing(true);
    try {
      await onRepay(parseFloat(repayAmount), selectedRepayAsset);
      setRepayAmount('');
      setSelectedRepayAsset('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="borrow" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="borrow">Borrow</TabsTrigger>
          <TabsTrigger value="repay">Repay</TabsTrigger>
        </TabsList>

        <TabsContent value="borrow" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Coins className="h-5 w-5" />
                <span>Cross-Chain Borrowing</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Collateral Selection */}
              <div className="space-y-3">
                <Label>Select Collateral</Label>
                <Select value={selectedCollateral} onValueChange={setSelectedCollateral}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose collateral asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_ASSETS.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{asset.icon}</span>
                          <span>{asset.name}</span>
                          <Badge variant="outline">{asset.chain}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Borrow Asset Selection */}
              <div className="space-y-3">
                <Label>Asset to Borrow</Label>
                <Select value={selectedBorrowAsset} onValueChange={setSelectedBorrowAsset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose asset to borrow" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_ASSETS.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{asset.icon}</span>
                            <span>{asset.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{asset.apy}</Badge>
                            <Badge variant="secondary">{asset.chain}</Badge>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Target Chain Selection */}
              <div className="space-y-3">
                <Label>Receive on Chain</Label>
                <Select value={borrowChain} onValueChange={setBorrowChain}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose destination chain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="base">Base</SelectItem>
                    <SelectItem value="avalanche">Avalanche</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="solana">Solana</SelectItem>
                    <SelectItem value="zetachain">ZetaChain</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input */}
              <div className="space-y-3">
                <Label>Amount to Borrow</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  className="text-right text-lg"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Available to borrow: $50,000</span>
                  <span>Max LTV: 80%</span>
                </div>
              </div>

              {/* AI Risk Assessment */}
              {borrowAmount && selectedCollateral && selectedBorrowAsset && (
                <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex items-center space-x-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    <span className="font-medium">AI Risk Assessment</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Credit Score:</span>
                      <span className="ml-2 font-medium text-success">Excellent (850)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Liquidation Risk:</span>
                      <span className="ml-2 font-medium text-success">Low (12%)</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Suggested LTV:</span>
                      <span className="ml-2 font-medium">65%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Interest Rate:</span>
                      <span className="ml-2 font-medium">4.2% APY</span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleBorrow} 
                disabled={!borrowAmount || !selectedCollateral || !selectedBorrowAsset || isProcessing}
                className="w-full gradient-primary"
                size="lg"
              >
                {isProcessing ? 'Processing...' : 'Borrow Cross-Chain'}
              </Button>
            </CardContent>
          </Card>

          {/* NFT Collateral Section */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>NFT Collateral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {NFT_COLLECTIONS.map((collection) => (
                  <div key={collection.name} className="p-4 rounded-lg border border-border/50 hover:border-primary/30 transition-colors cursor-pointer">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{collection.name}</h4>
                        <p className="text-sm text-muted-foreground">{collection.chain}</p>
                      </div>
                      <Badge variant="outline">{collection.floor}</Badge>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-3">
                      Use as Collateral
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="repay" className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ArrowDownUp className="h-5 w-5" />
                <span>Repay Loans</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Asset Selection */}
              <div className="space-y-3">
                <Label>Asset to Repay</Label>
                <Select value={selectedRepayAsset} onValueChange={setSelectedRepayAsset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose asset to repay" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_ASSETS.map((asset) => (
                      <SelectItem key={asset.symbol} value={asset.symbol}>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{asset.icon}</span>
                          <span>{asset.name}</span>
                          <Badge variant="outline">{asset.chain}</Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount Input */}
              <div className="space-y-3">
                <Label>Repayment Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  className="text-right text-lg"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Outstanding debt: $75,000</span>
                  <span>Wallet balance: $15,000</span>
                </div>
              </div>

              <Button 
                onClick={handleRepay} 
                disabled={!repayAmount || !selectedRepayAsset || isProcessing}
                className="w-full gradient-accent"
                size="lg"
              >
                {isProcessing ? 'Processing...' : 'Repay Loan'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}