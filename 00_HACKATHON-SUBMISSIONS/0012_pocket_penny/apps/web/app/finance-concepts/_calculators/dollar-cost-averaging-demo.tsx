"use client";

import { useMemo, useState } from "react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@pocketpenny/ui/components";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DollarCostAveragingDemoProps {
  onInteract: () => void;
}

// Simulated market data (monthly prices)
const marketPrices = [100, 85, 70, 80, 95, 110, 90, 75, 85, 100, 120, 105];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const DollarCostAveragingDemo: React.FC<DollarCostAveragingDemoProps> = ({ onInteract }) => {
  const [monthlyInvestment, setMonthlyInvestment] = useState(500);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const dcaData = useMemo(() => {
    const result = [];
    let totalInvested = 0;
    let totalShares = 0;

    for (let i = 0; i < Math.min(currentStep + 1, marketPrices.length); i++) {
      totalInvested += monthlyInvestment;
      const sharesThisMonth = monthlyInvestment / (marketPrices[i] ?? 1);
      totalShares += sharesThisMonth;

      result.push({
        month: months[i],
        price: marketPrices[i],
        invested: monthlyInvestment,
        shares: Number(sharesThisMonth.toFixed(2)),
        totalShares: Number(totalShares.toFixed(2)),
        totalInvested,
        currentValue: Number((totalShares * (marketPrices[i] ?? 0)).toFixed(2)),
        averageCost: Number((totalInvested / totalShares).toFixed(2)),
      });
    }

    return result;
  }, [currentStep, monthlyInvestment]);

  const runSimulation = () => {
    onInteract();
    setIsRunning(true);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev >= marketPrices.length - 1) {
          clearInterval(interval);
          setIsRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, 800);
  };

  const resetSimulation = () => {
    setCurrentStep(0);
    setIsRunning(false);
  };

  const currentData = dcaData[dcaData.length - 1];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📊 Dollar-Cost Averaging Simulator</CardTitle>
          <CardDescription>Watch how consistent investing helps smooth out market volatility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="monthlyAmount">Monthly Investment</Label>
              <Input
                id="monthlyAmount"
                type="number"
                value={monthlyInvestment}
                onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
                className="mt-1"
              />
            </div>

            <div className="flex flex-col justify-end">
              <Button onClick={runSimulation} disabled={isRunning} className="w-full">
                {isRunning ? "Running..." : "Start Simulation"}
              </Button>
            </div>

            <div className="flex flex-col justify-end">
              <Button onClick={resetSimulation} variant="outline" className="w-full">
                Reset
              </Button>
            </div>
          </div>

          {currentData && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm text-blue-600">Total Invested</p>
                <p className="font-semibold text-blue-900">${currentData.totalInvested.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm text-green-600">Current Value</p>
                <p className="font-semibold text-green-900">${currentData.currentValue.toLocaleString()}</p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <p className="text-sm text-orange-600">Total Shares</p>
                <p className="font-semibold text-orange-900">{currentData.totalShares.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                <p className="text-sm text-purple-600">Average Cost</p>
                <p className="font-semibold text-purple-900">${currentData.averageCost.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div>
              <h3 className="mb-4 font-semibold">Market Price Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={marketPrices.slice(0, currentStep + 1).map((price, i) => ({ month: months[i], price }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={["dataMin - 10", "dataMax + 10"]} />
                    <Tooltip formatter={(value) => [`$${value}`, "Stock Price"]} />
                    <Line type="monotone" dataKey="price" stroke="#dc2626" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div>
              <h3 className="mb-4 font-semibold">Shares Purchased Each Month</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dcaData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${Number(value).toFixed(2)}`, "Shares"]} />
                    <Bar dataKey="shares" fill="#059669" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {dcaData.length > 0 && (
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="mb-3 font-semibold">Monthly Breakdown</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="p-2 text-left">Month</th>
                      <th className="p-2 text-right">Stock Price</th>
                      <th className="p-2 text-right">Invested</th>
                      <th className="p-2 text-right">Shares Bought</th>
                      <th className="p-2 text-right">Total Shares</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dcaData.map((data, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2">{data.month}</td>
                        <td className="p-2 text-right">${data.price}</td>
                        <td className="p-2 text-right">${data.invested}</td>
                        <td className="p-2 text-right">{data.shares}</td>
                        <td className="p-2 text-right">{data.totalShares}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-blue-800">Key Benefits of Dollar-Cost Averaging:</h4>
            <ul className="space-y-1 text-sm text-blue-700">
              <li>
                • <strong>Reduces timing risk:</strong> You don't need to guess when to buy
              </li>
              <li>
                • <strong>Smooths volatility:</strong> Buy more shares when prices are low, fewer when high
              </li>
              <li>
                • <strong>Builds discipline:</strong> Consistent investing regardless of market emotions
              </li>
              <li>
                • <strong>Lower average cost:</strong> Your average cost is often lower than random lump sums
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
