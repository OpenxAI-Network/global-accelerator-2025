"use client";

import { useState } from "react";

import { Badge } from "@pocketpenny/ui/components/badge";
import { Button } from "@pocketpenny/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pocketpenny/ui/components/card";
import { AlertTriangle, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface MarketVolatilityDemoProps {
  onInteract: () => void;
}

export const MarketVolatilityDemo: React.FC<MarketVolatilityDemoProps> = ({ onInteract }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<"2008" | "2020" | "2022" | "dotcom">("2020");
  const [showStrategy, setShowStrategy] = useState(false);

  // Historical market data approximations
  const marketData: Record<string, Array<{ month: string; market: number; volatility: number; dca: number }>> = {
    "2008": [
      { month: "Jan 08", market: 100, volatility: 15, dca: 100 },
      { month: "Mar 08", market: 95, volatility: 22, dca: 98 },
      { month: "May 08", market: 85, volatility: 28, dca: 94 },
      { month: "Jul 08", market: 75, volatility: 35, dca: 88 },
      { month: "Sep 08", market: 65, volatility: 45, dca: 81 },
      { month: "Nov 08", market: 55, volatility: 50, dca: 73 },
      { month: "Jan 09", market: 50, volatility: 48, dca: 65 },
      { month: "Mar 09", market: 48, volatility: 45, dca: 58 },
      { month: "May 09", market: 55, volatility: 40, dca: 56 },
      { month: "Jul 09", market: 65, volatility: 32, dca: 58 },
      { month: "Sep 09", market: 75, volatility: 28, dca: 63 },
      { month: "Nov 09", market: 85, volatility: 25, dca: 70 },
      { month: "Jan 10", market: 95, volatility: 22, dca: 78 },
      { month: "Mar 10", market: 105, volatility: 20, dca: 87 },
      { month: "May 10", market: 115, volatility: 18, dca: 97 },
      { month: "Jul 10", market: 125, volatility: 16, dca: 108 },
    ],
    "2020": [
      { month: "Jan 20", market: 100, volatility: 18, dca: 100 },
      { month: "Feb 20", market: 95, volatility: 25, dca: 98 },
      { month: "Mar 20", market: 70, volatility: 60, dca: 88 },
      { month: "Apr 20", market: 75, volatility: 55, dca: 81 },
      { month: "May 20", market: 85, volatility: 40, dca: 80 },
      { month: "Jun 20", market: 95, volatility: 35, dca: 83 },
      { month: "Jul 20", market: 105, volatility: 30, dca: 88 },
      { month: "Aug 20", market: 115, volatility: 28, dca: 95 },
      { month: "Sep 20", market: 110, volatility: 32, dca: 98 },
      { month: "Oct 20", market: 105, volatility: 35, dca: 99 },
      { month: "Nov 20", market: 120, volatility: 25, dca: 105 },
      { month: "Dec 20", market: 125, volatility: 22, dca: 110 },
      { month: "Jan 21", market: 130, volatility: 20, dca: 116 },
      { month: "Feb 21", market: 135, volatility: 18, dca: 122 },
      { month: "Mar 21", market: 140, volatility: 16, dca: 128 },
    ],
    "2022": [
      { month: "Jan 22", market: 100, volatility: 20, dca: 100 },
      { month: "Feb 22", market: 95, volatility: 28, dca: 98 },
      { month: "Mar 22", market: 85, volatility: 35, dca: 93 },
      { month: "Apr 22", market: 80, volatility: 32, dca: 88 },
      { month: "May 22", market: 75, volatility: 38, dca: 82 },
      { month: "Jun 22", market: 70, volatility: 42, dca: 76 },
      { month: "Jul 22", market: 75, volatility: 40, dca: 73 },
      { month: "Aug 22", market: 80, volatility: 35, dca: 73 },
      { month: "Sep 22", market: 75, volatility: 38, dca: 72 },
      { month: "Oct 22", market: 70, volatility: 45, dca: 70 },
      { month: "Nov 22", market: 80, volatility: 35, dca: 71 },
      { month: "Dec 22", market: 85, volatility: 30, dca: 74 },
      { month: "Jan 23", market: 95, volatility: 25, dca: 79 },
      { month: "Feb 23", market: 105, volatility: 22, dca: 86 },
      { month: "Mar 23", market: 110, volatility: 20, dca: 93 },
    ],
    dotcom: [
      { month: "Jan 00", market: 100, volatility: 25, dca: 100 },
      { month: "Mar 00", market: 85, volatility: 40, dca: 93 },
      { month: "May 00", market: 70, volatility: 45, dca: 82 },
      { month: "Jul 00", market: 60, volatility: 50, dca: 72 },
      { month: "Sep 00", market: 55, volatility: 52, dca: 63 },
      { month: "Nov 00", market: 50, volatility: 55, dca: 55 },
      { month: "Jan 01", market: 45, volatility: 58, dca: 47 },
      { month: "Mar 01", market: 40, volatility: 60, dca: 40 },
      { month: "May 01", market: 38, volatility: 58, dca: 35 },
      { month: "Jul 01", market: 35, volatility: 55, dca: 31 },
      { month: "Sep 01", market: 30, volatility: 60, dca: 27 },
      { month: "Nov 01", market: 32, volatility: 55, dca: 25 },
      { month: "Jan 02", market: 35, volatility: 50, dca: 25 },
      { month: "Mar 02", market: 40, volatility: 45, dca: 26 },
      { month: "May 02", market: 45, volatility: 40, dca: 29 },
      { month: "Jul 02", market: 50, volatility: 35, dca: 33 },
      { month: "Sep 02", market: 55, volatility: 30, dca: 37 },
      { month: "Nov 02", market: 65, volatility: 28, dca: 43 },
      { month: "Jan 03", market: 75, volatility: 25, dca: 50 },
      { month: "Mar 03", market: 85, volatility: 22, dca: 58 },
    ],
  };

  const currentData = marketData[selectedPeriod] ?? [];

  const periodInfo = {
    "2008": {
      name: "2008 Financial Crisis",
      description: "Subprime mortgage crisis leads to global recession",
      maxDrawdown: -50,
      recovery: "18 months",
      lesson: "Markets recover, but it takes time and patience",
    },
    "2020": {
      name: "2020 COVID-19 Crash",
      description: "Pandemic fears cause rapid market decline",
      maxDrawdown: -30,
      recovery: "5 months",
      lesson: "Quick recovery with stimulus and vaccine hopes",
    },
    "2022": {
      name: "2022 Bear Market",
      description: "Inflation concerns and rate hikes pressure markets",
      maxDrawdown: -30,
      recovery: "12 months",
      lesson: "Gradual recovery as inflation fears subside",
    },
    dotcom: {
      name: "2000 Dot-com Bubble",
      description: "Tech bubble bursts, massive overvaluation correction",
      maxDrawdown: -70,
      recovery: "36 months",
      lesson: "Longest recovery, shows importance of valuation",
    },
  };

  const info = periodInfo[selectedPeriod];
  const finalMarketValue = currentData[currentData.length - 1]?.market ?? 0;
  const finalDCAValue = currentData[currentData.length - 1]?.dca ?? 0;
  const maxVolatility = currentData.length > 0 ? Math.max(...currentData.map((d) => d.volatility)) : 0;

  const handlePeriodChange = (period: typeof selectedPeriod) => {
    onInteract();
    setSelectedPeriod(period);
    setShowStrategy(false);
  };

  const survivalStrategies = [
    {
      title: "Don't Panic Sell",
      description: "Selling during crashes locks in losses. Markets have always recovered over time.",
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
    },
    {
      title: "Keep Dollar-Cost Averaging",
      description: "Regular investing during downturns buys more shares at lower prices.",
      icon: <DollarSign className="h-5 w-5 text-green-500" />,
    },
    {
      title: "Maintain Long-term Perspective",
      description: "Focus on your 10-20 year goals, not daily market movements.",
      icon: <TrendingUp className="h-5 w-5 text-blue-500" />,
    },
    {
      title: "Review Your Risk Tolerance",
      description: "Use market stress to understand your true comfort level with volatility.",
      icon: <TrendingDown className="h-5 w-5 text-orange-500" />,
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📉 Market Volatility Simulator</CardTitle>
          <CardDescription>Experience historical market crashes and learn how to navigate volatility</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Period Selection */}
            <div>
              <h3 className="mb-4 font-semibold">Choose a Historical Period</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {Object.entries(periodInfo).map(([key, info]) => (
                  <Button
                    key={key}
                    variant={selectedPeriod === key ? "default" : "outline"}
                    onClick={() => handlePeriodChange(key as typeof selectedPeriod)}
                    className="h-auto p-3 text-left"
                  >
                    <div>
                      <div className="text-sm font-semibold">{key === "dotcom" ? "2000" : key}</div>
                      <div className="text-xs opacity-75">{info.maxDrawdown}% max drop</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Period Info */}
            <Card className="border-dashed">
              <CardContent className="p-4">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold">{info.name}</h3>
                    <p className="text-gray-600">{info.description}</p>
                  </div>
                  <Badge
                    className={finalMarketValue >= 100 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {finalMarketValue >= 100 ? "Recovered" : "Still Down"}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Max Drawdown:</span>
                    <div className="font-semibold text-red-600">{info.maxDrawdown}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Recovery Time:</span>
                    <div className="font-semibold">{info.recovery}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Max Volatility:</span>
                    <div className="font-semibold text-orange-600">{maxVolatility}%</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Chart */}
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData}>
                  <defs>
                    <linearGradient id="marketGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="dcaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, "dataMax + 20"]} />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)}${name === "volatility" ? "%" : ""}`,
                      name === "market" ? "Lump Sum" : name === "dca" ? "Dollar-Cost Avg" : "Volatility",
                    ]}
                  />
                  <Area type="monotone" dataKey="market" stroke="#dc2626" strokeWidth={2} fill="url(#marketGradient)" />
                  <Area type="monotone" dataKey="dca" stroke="#059669" strokeWidth={2} fill="url(#dcaGradient)" />
                  <Line type="monotone" dataKey="volatility" stroke="#f59e0b" strokeWidth={1} strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Results */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-sm text-red-600">Lump Sum Final</p>
                <p className="font-semibold text-red-900">{finalMarketValue.toFixed(0)}</p>
                <p className="text-xs text-red-500">
                  {finalMarketValue >= 100 ? "+" : ""}
                  {(finalMarketValue - 100).toFixed(0)}%
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-600">DCA Final</p>
                <p className="font-semibold text-green-900">{finalDCAValue.toFixed(0)}</p>
                <p className="text-xs text-green-500">
                  {finalDCAValue >= 100 ? "+" : ""}
                  {(finalDCAValue - 100).toFixed(0)}%
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <p className="text-sm text-orange-600">Max Volatility</p>
                <p className="font-semibold text-orange-900">{maxVolatility}%</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-600">Recovery Time</p>
                <p className="font-semibold text-blue-900">{info.recovery}</p>
              </div>
            </div>

            {/* Survival Strategies */}
            <div className="text-center">
              <Button onClick={() => setShowStrategy(!showStrategy)} variant={showStrategy ? "default" : "outline"}>
                {showStrategy ? "Hide" : "Show"} Survival Strategies
              </Button>
            </div>

            {showStrategy && (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {survivalStrategies.map((strategy, index) => (
                  <Card key={index} className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {strategy.icon}
                        <div>
                          <h4 className="font-semibold">{strategy.title}</h4>
                          <p className="mt-1 text-sm text-gray-600">{strategy.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Key Lesson */}
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
              <h3 className="mb-2 text-lg font-semibold text-blue-800">Key Lesson: {info.lesson}</h3>
              <p className="text-blue-700">
                Notice how dollar-cost averaging (green line) often performs better during volatile periods. By
                investing regularly regardless of market conditions, you buy more shares when prices are low and fewer
                when prices are high, leading to better average prices over time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
