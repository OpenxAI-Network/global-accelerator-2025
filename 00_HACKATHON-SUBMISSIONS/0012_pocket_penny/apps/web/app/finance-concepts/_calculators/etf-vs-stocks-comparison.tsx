"use client";

import { useState } from "react";

import { Badge } from "@pocketpenny/ui/components/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pocketpenny/ui/components/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@pocketpenny/ui/components/tabs";
import { CheckCircle, Clock, DollarSign, Shield, TrendingUp, XCircle } from "lucide-react";

interface ETFvsStocksComparisonProps {
  onInteract: () => void;
}

export const ETFvsStocksComparison: React.FC<ETFvsStocksComparisonProps> = ({ onInteract }) => {
  const [selectedInvestmentType, setSelectedInvestmentType] = useState<"etf" | "stocks" | null>(null);

  const handleSelection = (type: "etf" | "stocks") => {
    onInteract();
    setSelectedInvestmentType(type);
  };

  const etfFeatures = [
    { feature: "Diversification", pro: true, description: "Instant diversification across hundreds of companies" },
    { feature: "Research Required", pro: true, description: "Minimal research needed, professional management" },
    { feature: "Volatility", pro: true, description: "Lower volatility due to diversification" },
    { feature: "Costs", pro: true, description: "Very low expense ratios (0.03% - 0.20%)" },
    { feature: "Time Investment", pro: true, description: "Set it and forget it approach" },
    { feature: "Control", pro: false, description: "No control over individual holdings" },
    { feature: "Potential Returns", pro: false, description: "Market average returns, no outperformance" },
  ];

  const stockFeatures = [
    { feature: "Potential Returns", pro: true, description: "Possibility of exceptional returns from winners" },
    { feature: "Control", pro: true, description: "Full control over investment decisions" },
    { feature: "Learning", pro: true, description: "Deep understanding of individual businesses" },
    { feature: "Research Required", pro: false, description: "Extensive research and analysis needed" },
    { feature: "Volatility", pro: false, description: "Higher volatility, especially individual stocks" },
    { feature: "Time Investment", pro: false, description: "Significant time for research and monitoring" },
    { feature: "Diversification", pro: false, description: "Must build diversification manually" },
  ];

  const investmentScenarios = [
    {
      title: "New Investor with $1,000",
      etfRecommendation: "Perfect fit! Start with a broad market ETF like VTI or VOO",
      stockRecommendation: "Challenging - hard to diversify with limited funds",
      winner: "etf",
    },
    {
      title: "Busy Professional",
      etfRecommendation: "Ideal - minimal time investment required",
      stockRecommendation: "Difficult without time for research",
      winner: "etf",
    },
    {
      title: "Investment Enthusiast",
      etfRecommendation: "Good foundation, but may want more control",
      stockRecommendation: "Great if you enjoy research and analysis",
      winner: "stocks",
    },
    {
      title: "Retirement Investor",
      etfRecommendation: "Excellent for long-term, stable growth",
      stockRecommendation: "Higher risk, requires more management",
      winner: "etf",
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">🏢 ETFs vs Individual Stocks</CardTitle>
          <CardDescription>Compare investment approaches and find what works best for your situation</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="comparison" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="comparison">Head-to-Head</TabsTrigger>
              <TabsTrigger value="scenarios">Your Situation</TabsTrigger>
              <TabsTrigger value="examples">Real Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="comparison" className="mt-6">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedInvestmentType === "etf" ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => handleSelection("etf")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      ETFs (Exchange-Traded Funds)
                      <Badge className="bg-green-100 text-green-800">Beginner Friendly</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {etfFeatures.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          {item.pro ? (
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                          ) : (
                            <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">{item.feature}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedInvestmentType === "stocks" ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => handleSelection("stocks")}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      Individual Stocks
                      <Badge className="bg-orange-100 text-orange-800">Advanced</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {stockFeatures.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          {item.pro ? (
                            <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                          ) : (
                            <XCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                          )}
                          <div>
                            <div className="font-medium">{item.feature}</div>
                            <div className="text-sm text-gray-600">{item.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedInvestmentType && (
                <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <h3 className="mb-2 font-semibold text-blue-800">
                    {selectedInvestmentType === "etf" ? "ETFs" : "Individual Stocks"} - Good Choice!
                  </h3>
                  <p className="text-blue-700">
                    {selectedInvestmentType === "etf"
                      ? "ETFs are perfect for most investors. They provide instant diversification, require minimal research, and have historically delivered solid returns with lower risk."
                      : "Individual stocks can be rewarding if you have time for research and enjoy analyzing companies. Just remember to diversify and never invest more than you can afford to lose in any single stock."}
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="scenarios" className="mt-6">
              <div className="space-y-4">
                <h3 className="mb-4 text-xl font-semibold">Which is better for your situation?</h3>
                {investmentScenarios.map((scenario, index) => (
                  <Card key={index} className="cursor-pointer transition-shadow hover:shadow-md" onClick={onInteract}>
                    <CardContent className="p-4">
                      <div className="mb-3 flex items-start justify-between">
                        <h4 className="text-lg font-semibold">{scenario.title}</h4>
                        <Badge
                          className={
                            scenario.winner === "etf" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                          }
                        >
                          {scenario.winner === "etf" ? "ETF Winner" : "Stocks Winner"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">ETFs</span>
                          </div>
                          <p className="text-sm text-gray-600">{scenario.etfRecommendation}</p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span className="font-medium">Individual Stocks</span>
                          </div>
                          <p className="text-sm text-gray-600">{scenario.stockRecommendation}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="examples" className="mt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Popular ETFs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold">VTI - Total Stock Market</h4>
                        <p className="text-sm text-gray-600">Owns pieces of ~4,000 US companies</p>
                        <p className="text-sm text-blue-600">Expense ratio: 0.03%</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold">VOO - S&P 500</h4>
                        <p className="text-sm text-gray-600">Top 500 US companies</p>
                        <p className="text-sm text-blue-600">Expense ratio: 0.03%</p>
                      </div>
                      <div className="border-l-4 border-purple-500 pl-4">
                        <h4 className="font-semibold">VXUS - International</h4>
                        <p className="text-sm text-gray-600">Non-US companies worldwide</p>
                        <p className="text-sm text-blue-600">Expense ratio: 0.08%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Individual Stock Examples</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-4 border-blue-500 pl-4">
                        <h4 className="font-semibold">Apple (AAPL)</h4>
                        <p className="text-sm text-gray-600">Technology giant, consumer electronics</p>
                        <p className="text-sm text-green-600">✓ Strong brand, stable business</p>
                        <p className="text-sm text-red-600">✗ High concentration risk</p>
                      </div>
                      <div className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold">Microsoft (MSFT)</h4>
                        <p className="text-sm text-gray-600">Software, cloud computing</p>
                        <p className="text-sm text-green-600">✓ Diverse revenue streams</p>
                        <p className="text-sm text-red-600">✗ Requires research to understand</p>
                      </div>
                      <div className="border-l-4 border-orange-500 pl-4">
                        <h4 className="font-semibold">Tesla (TSLA)</h4>
                        <p className="text-sm text-gray-600">Electric vehicles, energy</p>
                        <p className="text-sm text-green-600">✓ High growth potential</p>
                        <p className="text-sm text-red-600">✗ Very volatile, speculative</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <Shield className="mb-2 h-6 w-6 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-800">Risk Level</h4>
                  <p className="text-sm text-yellow-700">ETFs: Lower, Stocks: Higher</p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <Clock className="mb-2 h-6 w-6 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Time Required</h4>
                  <p className="text-sm text-blue-700">ETFs: Minimal, Stocks: Significant</p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <TrendingUp className="mb-2 h-6 w-6 text-green-600" />
                  <h4 className="font-semibold text-green-800">Beginner Friendly</h4>
                  <p className="text-sm text-green-700">ETFs: Very, Stocks: Moderate</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
