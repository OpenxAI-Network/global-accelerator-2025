"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pocketpenny/ui/components/card";
import { Input } from "@pocketpenny/ui/components/input";
import { Label } from "@pocketpenny/ui/components/label";
import { Slider } from "@pocketpenny/ui/components/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@pocketpenny/ui/components/tabs";
import { DollarSign, Home, ShoppingCart, TrendingDown } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface InflationImpactDemoProps {
  onInteract: () => void;
}

// Real-world price examples over time
const historicalPrices = {
  car: [
    { year: 1980, price: 7000, item: "Average New Car" },
    { year: 1990, price: 15500, item: "Average New Car" },
    { year: 2000, price: 22000, item: "Average New Car" },
    { year: 2010, price: 29000, item: "Average New Car" },
    { year: 2020, price: 38000, item: "Average New Car" },
    { year: 2023, price: 48000, item: "Average New Car" },
  ],
  house: [
    { year: 1980, price: 68000, item: "Median Home" },
    { year: 1990, price: 123000, item: "Median Home" },
    { year: 2000, price: 165000, item: "Median Home" },
    { year: 2010, price: 222000, item: "Median Home" },
    { year: 2020, price: 329000, item: "Median Home" },
    { year: 2023, price: 436000, item: "Median Home" },
  ],
  coffee: [
    { year: 1980, price: 0.45, item: "Cup of Coffee" },
    { year: 1990, price: 0.75, item: "Cup of Coffee" },
    { year: 2000, price: 1.25, item: "Cup of Coffee" },
    { year: 2010, price: 1.85, item: "Cup of Coffee" },
    { year: 2020, price: 2.7, item: "Cup of Coffee" },
    { year: 2023, price: 3.15, item: "Cup of Coffee" },
  ],
  college: [
    { year: 1980, price: 3500, item: "College Tuition (1 year)" },
    { year: 1990, price: 7600, item: "College Tuition (1 year)" },
    { year: 2000, price: 13200, item: "College Tuition (1 year)" },
    { year: 2010, price: 21000, item: "College Tuition (1 year)" },
    { year: 2020, price: 37600, item: "College Tuition (1 year)" },
    { year: 2023, price: 42000, item: "College Tuition (1 year)" },
  ],
};

export const InflationImpactDemo: React.FC<InflationImpactDemoProps> = ({ onInteract }) => {
  const [currentAmount, setCurrentAmount] = useState(100000);
  const [inflationRate, setInflationRate] = useState([3]);
  const [years, setYears] = useState([20]);
  const [selectedItem, setSelectedItem] = useState("car");

  // Calculate purchasing power over time
  const purchasingPowerData = useMemo(() => {
    onInteract();

    const data = [];
    const rate = (inflationRate[0] ?? 3) / 100;

    for (let year = 0; year <= (years[0] ?? 20); year++) {
      const realValue = currentAmount / Math.pow(1 + rate, year);
      const nominalValue = currentAmount;

      data.push({
        year: new Date().getFullYear() + year,
        purchasingPower: Math.round(realValue),
        nominalValue: nominalValue,
        inflationLoss: Math.round(nominalValue - realValue),
      });
    }

    return data;
  }, [currentAmount, inflationRate, years, onInteract]);

  // Calculate what you could buy today vs future
  const buyingPowerComparison = useMemo(() => {
    const rate = (inflationRate[0] ?? 3) / 100;
    const futureValue = currentAmount / Math.pow(1 + rate, years[0] ?? 20);

    const items = [
      { name: "Groceries ($100/week)", today: Math.floor(currentAmount / 100), future: Math.floor(futureValue / 100) },
      { name: "Gas ($4/gallon)", today: Math.floor(currentAmount / 4), future: Math.floor(futureValue / 4) },
      { name: "Movie Tickets ($15 each)", today: Math.floor(currentAmount / 15), future: Math.floor(futureValue / 15) },
      {
        name: "Restaurant Meals ($25 each)",
        today: Math.floor(currentAmount / 25),
        future: Math.floor(futureValue / 25),
      },
    ];

    return items;
  }, [currentAmount, inflationRate, years]);

  const finalPurchasingPower = purchasingPowerData[purchasingPowerData.length - 1]?.purchasingPower || 0;
  const totalInflationLoss = currentAmount - finalPurchasingPower;
  const inflationLossPercentage = (totalInflationLoss / currentAmount) * 100;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📉 Inflation Impact Calculator</CardTitle>
          <CardDescription>
            See how inflation erodes your purchasing power over time and why investing matters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calculator">Impact Calculator</TabsTrigger>
              <TabsTrigger value="historical">Historical Examples</TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6">
              {/* Controls */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <Label htmlFor="amount">Amount of Money</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Inflation Rate: {inflationRate[0]}% per year</Label>
                  <Slider
                    value={inflationRate}
                    onValueChange={setInflationRate}
                    max={8}
                    min={1}
                    step={0.5}
                    className="mt-2"
                  />
                  <div className="mt-1 flex justify-between text-sm text-gray-500">
                    <span>1%</span>
                    <span>8%</span>
                  </div>
                </div>

                <div>
                  <Label>Time Period: {years[0]} years</Label>
                  <Slider value={years} onValueChange={setYears} max={40} min={5} step={5} className="mt-2" />
                  <div className="mt-1 flex justify-between text-sm text-gray-500">
                    <span>5 years</span>
                    <span>40 years</span>
                  </div>
                </div>
              </div>

              {/* Results Summary */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
                  <DollarSign className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                  <p className="text-sm text-blue-600">Today's Value</p>
                  <p className="text-xl font-bold text-blue-900">${currentAmount.toLocaleString()}</p>
                </div>

                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
                  <TrendingDown className="mx-auto mb-2 h-8 w-8 text-red-600" />
                  <p className="text-sm text-red-600">Future Buying Power</p>
                  <p className="text-xl font-bold text-red-900">${finalPurchasingPower.toLocaleString()}</p>
                </div>

                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 text-center">
                  <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-orange-600" />
                  <p className="text-sm text-orange-600">Purchasing Power Lost</p>
                  <p className="text-xl font-bold text-orange-900">{inflationLossPercentage.toFixed(1)}%</p>
                </div>

                <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-center">
                  <Home className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                  <p className="text-sm text-purple-600">Dollar Amount Lost</p>
                  <p className="text-xl font-bold text-purple-900">${totalInflationLoss.toLocaleString()}</p>
                </div>
              </div>

              {/* Chart */}
              <div className="h-80">
                <h3 className="mb-4 font-semibold">Purchasing Power Over Time</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={purchasingPowerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `$${value.toLocaleString()}`,
                        name === "purchasingPower" ? "Real Purchasing Power" : "Nominal Value",
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="nominalValue"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="nominalValue"
                    />
                    <Line
                      type="monotone"
                      dataKey="purchasingPower"
                      stroke="#DC2626"
                      strokeWidth={3}
                      name="purchasingPower"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* What You Can Buy Comparison */}
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">What ${currentAmount.toLocaleString()} Can Buy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {buyingPowerComparison.map((item, index) => (
                      <div key={index} className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{item.today}</div>
                            <div className="text-xs text-gray-500">Today</div>
                          </div>
                          <span className="text-gray-400">→</span>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">{item.future}</div>
                            <div className="text-xs text-gray-500">In {years[0]} years</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="historical" className="space-y-6">
              {/* Item Selection */}
              <div>
                <h3 className="mb-4 font-semibold">Choose an Item to See Historical Price Changes</h3>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {Object.entries(historicalPrices).map(([key, data]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedItem(key)}
                      className={`rounded-lg border p-3 text-left transition-all ${
                        selectedItem === key ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="font-semibold capitalize">{key}</div>
                      <div className="text-sm text-gray-600">{data[0]?.item}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Historical Chart */}
              <div className="h-80">
                <h3 className="mb-4 font-semibold">
                  {historicalPrices[selectedItem as keyof typeof historicalPrices]?.[0]?.item ?? "Item"} Price History
                </h3>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalPrices[selectedItem as keyof typeof historicalPrices]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `$${value.toLocaleString()}`} />
                    <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, "Price"]} />
                    <Bar dataKey="price" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Historical Analysis */}
              <Card className="border-dashed">
                <CardContent className="p-6">
                  <h3 className="mb-4 text-lg font-semibold">Price Change Analysis</h3>
                  {(() => {
                    const data = historicalPrices[selectedItem as keyof typeof historicalPrices];
                    if (!data || data.length === 0) return null;

                    const startPrice = data[0]?.price ?? 0;
                    const endPrice = data[data.length - 1]?.price ?? 0;
                    const totalIncrease = ((endPrice - startPrice) / startPrice) * 100;
                    const startYear = data[0]?.year ?? 0;
                    const endYear = data[data.length - 1]?.year ?? 0;
                    const years = endYear - startYear;
                    const annualInflation = years > 0 ? Math.pow(endPrice / startPrice, 1 / years) - 1 : 0;

                    return (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div className="rounded-lg bg-red-50 p-4 text-center">
                          <div className="text-2xl font-bold text-red-600">+{totalIncrease.toFixed(0)}%</div>
                          <div className="text-sm text-red-700">Total Price Increase</div>
                          <div className="text-xs text-gray-500">
                            {startYear} - {endYear}
                          </div>
                        </div>
                        <div className="rounded-lg bg-orange-50 p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">
                            {(annualInflation * 100).toFixed(1)}%
                          </div>
                          <div className="text-sm text-orange-700">Average Annual Increase</div>
                          <div className="text-xs text-gray-500">Compound annual growth</div>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{(endPrice / startPrice).toFixed(1)}x</div>
                          <div className="text-sm text-blue-700">Price Multiplier</div>
                          <div className="text-xs text-gray-500">How many times more expensive</div>
                        </div>
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Inflation Insights */}
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-yellow-800">Key Insights About Inflation</h3>
                <div className="space-y-3 text-yellow-700">
                  <p>
                    • <strong>It's inevitable:</strong> Prices generally rise over time due to economic growth and
                    monetary policy
                  </p>
                  <p>
                    • <strong>It compounds:</strong> Even modest 3% inflation cuts purchasing power in half over 23
                    years
                  </p>
                  <p>
                    • <strong>Cash loses value:</strong> Money sitting in low-yield accounts loses purchasing power
                    annually
                  </p>
                  <p>
                    • <strong>Investing helps:</strong> Assets like stocks and real estate often grow faster than
                    inflation
                  </p>
                  <p>
                    • <strong>Start early:</strong> The sooner you invest, the more time your money has to outpace
                    inflation
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
