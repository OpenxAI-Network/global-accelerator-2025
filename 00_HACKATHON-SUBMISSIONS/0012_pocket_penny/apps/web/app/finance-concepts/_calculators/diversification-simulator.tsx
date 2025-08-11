"use client";

import { useMemo, useState } from "react";

import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Slider,
} from "@pocketpenny/ui/components";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface DiversificationSimulatorProps {
  onInteract: () => void;
}

// Simulated market scenarios (returns in %)
const scenarios = [
  {
    name: "Bull Market",
    tech: 25,
    healthcare: 15,
    finance: 20,
    consumer: 18,
    energy: 22,
    utilities: 8,
    reits: 12,
    international: 15,
  },
  {
    name: "Bear Market",
    tech: -20,
    healthcare: -10,
    finance: -25,
    consumer: -15,
    energy: -30,
    utilities: -5,
    reits: -18,
    international: -12,
  },
  {
    name: "Tech Crash",
    tech: -40,
    healthcare: 5,
    finance: 8,
    consumer: 10,
    energy: 15,
    utilities: 12,
    reits: 8,
    international: 5,
  },
  {
    name: "Recession",
    tech: -15,
    healthcare: -5,
    finance: -20,
    consumer: -25,
    energy: -18,
    utilities: 2,
    reits: -10,
    international: -8,
  },
  {
    name: "Inflation Spike",
    tech: -10,
    healthcare: 8,
    finance: 12,
    consumer: -5,
    energy: 35,
    utilities: 15,
    reits: 20,
    international: 10,
  },
];
export const DiversificationSimulator: React.FC<DiversificationSimulatorProps> = ({ onInteract }) => {
  const [portfolioType, setPortfolioType] = useState<"concentrated" | "diversified" | "custom">("concentrated");
  const [customAllocations, setCustomAllocations] = useState({
    tech: 20,
    healthcare: 15,
    finance: 15,
    consumer: 15,
    energy: 10,
    utilities: 10,
    reits: 5,
    international: 10,
  });

  const portfolioTemplates = {
    concentrated: {
      tech: 80,
      healthcare: 10,
      finance: 5,
      consumer: 5,
      energy: 0,
      utilities: 0,
      reits: 0,
      international: 0,
    },
    diversified: {
      tech: 25,
      healthcare: 15,
      finance: 15,
      consumer: 15,
      energy: 8,
      utilities: 7,
      reits: 5,
      international: 10,
    },
  };

  const currentPortfolio = portfolioType === "custom" ? customAllocations : portfolioTemplates[portfolioType];

  const portfolioData = useMemo(() => {
    return (
      Object.entries(currentPortfolio)
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        .filter(([_, value]) => value > 0)
        .map(([sector, allocation]) => ({
          name: sector.charAt(0).toUpperCase() + sector.slice(1),
          value: allocation,
          color: getColorForSector(sector),
        }))
    );
  }, [currentPortfolio]);

  const scenarioResults = useMemo(() => {
    onInteract();
    return scenarios.map((scenario) => {
      const totalReturn = Object.entries(currentPortfolio).reduce((sum, [sector, allocation]) => {
        return sum + (allocation / 100) * Number(scenario[sector as keyof typeof scenario]);
      }, 0);

      return {
        scenario: scenario.name,
        return: Number(totalReturn.toFixed(2)),
      };
    });
  }, [currentPortfolio, onInteract]);

  function getColorForSector(sector: string) {
    const colors: Record<string, string> = {
      tech: "#3B82F6",
      healthcare: "#EF4444",
      finance: "#10B981",
      consumer: "#F59E0B",
      energy: "#8B5CF6",
      utilities: "#06B6D4",
      reits: "#F97316",
      international: "#84CC16",
    };
    return colors[sector] || "#6B7280";
  }

  const handleSliderChange = (sector: string, value: number[]) => {
    setCustomAllocations((prev) => ({
      ...prev,
      [sector]: value[0],
    }));
  };

  const normalizePortfolio = () => {
    const total = Object.values(customAllocations).reduce((sum, val) => sum + val, 0);
    if (total === 0) return;

    setCustomAllocations((prev) => {
      const normalized: typeof prev = {} as typeof prev;
      Object.entries(prev).forEach(([key, value]) => {
        normalized[key as keyof typeof prev] = Math.round((value / total) * 100);
      });
      return normalized;
    });
  };

  const totalAllocation = Object.values(currentPortfolio).reduce((sum, val) => sum + val, 0);
  const volatility = calculateVolatility(currentPortfolio);
  const diversificationScore = calculateDiversificationScore(currentPortfolio);

  function calculateVolatility(portfolio: typeof currentPortfolio) {
    // Simplified volatility calculation based on concentration
    const maxAllocation = Math.max(...Object.values(portfolio));
    return Math.round(maxAllocation * 0.8 + 5); // Rough approximation
  }

  function calculateDiversificationScore(portfolio: typeof currentPortfolio) {
    const nonZeroSectors = Object.values(portfolio).filter((val) => val > 0).length;
    const maxAllocation = Math.max(...Object.values(portfolio));

    // Score based on number of sectors and concentration
    let score = nonZeroSectors * 10;
    if (maxAllocation > 50) score -= 20;
    else if (maxAllocation > 30) score -= 10;

    return Math.min(100, Math.max(0, score));
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🎯 Portfolio Diversification Simulator</CardTitle>
          <CardDescription>
            See how diversification affects your portfolio's risk and returns across different market scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Portfolio Selection */}
            <div>
              <h3 className="mb-4 font-semibold">Choose Your Portfolio Style</h3>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={portfolioType === "concentrated" ? "default" : "outline"}
                  onClick={() => setPortfolioType("concentrated")}
                >
                  Concentrated (Risky)
                </Button>
                <Button
                  variant={portfolioType === "diversified" ? "default" : "outline"}
                  onClick={() => setPortfolioType("diversified")}
                >
                  Diversified (Balanced)
                </Button>
                <Button
                  variant={portfolioType === "custom" ? "default" : "outline"}
                  onClick={() => setPortfolioType("custom")}
                >
                  Custom (Build Your Own)
                </Button>
              </div>
            </div>

            {/* Custom Portfolio Builder */}
            {portfolioType === "custom" && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">Build Your Custom Portfolio</CardTitle>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm ${totalAllocation === 100 ? "text-green-600" : "text-red-600"}`}>
                      Total: {totalAllocation}%
                    </span>
                    {totalAllocation !== 100 && (
                      <Button size="sm" onClick={normalizePortfolio}>
                        Normalize to 100%
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Object.entries(customAllocations).map(([sector, value]) => (
                      <div key={sector}>
                        <div className="mb-2 flex justify-between">
                          <span className="capitalize">{sector}</span>
                          <span>{value}%</span>
                        </div>
                        <Slider
                          value={[value]}
                          onValueChange={(val) => handleSliderChange(sector, val)}
                          max={100}
                          step={5}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Portfolio Visualization */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Portfolio</CardTitle>
                  <div className="flex gap-2">
                    <Badge
                      className={
                        diversificationScore >= 70
                          ? "bg-green-100 text-green-800"
                          : diversificationScore >= 40
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }
                    >
                      Diversification: {diversificationScore}/100
                    </Badge>
                    <Badge variant="outline">Est. Volatility: {volatility}%</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={portfolioData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                          labelLine={false}
                        >
                          {portfolioData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Scenario Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Scenario Analysis</CardTitle>
                  <CardDescription>How your portfolio performs in different market conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scenarioResults}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="scenario" angle={-45} textAnchor="end" height={100} />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, "Return"]} />
                        <Bar dataKey="return" fill="#10B981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="font-semibold text-blue-800">Best Case Return</h4>
                <p className="text-2xl font-bold text-blue-900">
                  +{Math.max(...scenarioResults.map((s) => s.return)).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h4 className="font-semibold text-red-800">Worst Case Return</h4>
                <p className="text-2xl font-bold text-red-900">
                  {Math.min(...scenarioResults.map((s) => s.return)).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h4 className="font-semibold text-green-800">Average Return</h4>
                <p className="text-2xl font-bold text-green-900">
                  {(scenarioResults.reduce((sum, s) => sum + s.return, 0) / scenarioResults.length).toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Educational Content */}
            <div className="rounded-lg bg-gray-50 p-6">
              <h3 className="mb-4 text-lg font-semibold">Diversification Insights</h3>
              <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                <div>
                  <h4 className="mb-2 font-semibold text-green-800">✓ Benefits of Diversification:</h4>
                  <ul className="space-y-1 text-green-700">
                    <li>• Reduces portfolio volatility</li>
                    <li>• Protects against sector-specific risks</li>
                    <li>• Smoother returns over time</li>
                    <li>• Better sleep at night!</li>
                  </ul>
                </div>
                <div>
                  <h4 className="mb-2 font-semibold text-orange-800">⚠️ Concentration Risks:</h4>
                  <ul className="space-y-1 text-orange-700">
                    <li>• Higher volatility and risk</li>
                    <li>• Vulnerable to sector crashes</li>
                    <li>• Potential for larger losses</li>
                    <li>• Stress and emotional investing</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
