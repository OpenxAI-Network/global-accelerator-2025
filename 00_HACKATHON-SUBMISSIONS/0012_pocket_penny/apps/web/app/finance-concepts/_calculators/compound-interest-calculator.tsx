"use client";

import { useMemo, useState } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@pocketpenny/ui/components/card";
import { Input } from "@pocketpenny/ui/components/input";
import { Label } from "@pocketpenny/ui/components/label";
import { Slider } from "@pocketpenny/ui/components/slider";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface CompoundInterestCalculatorProps {
  onInteract: () => void;
}

export const CompoundInterestCalculator: React.FC<CompoundInterestCalculatorProps> = ({ onInteract }) => {
  const [principal, setPrincipal] = useState(1000);
  const [monthlyContribution, setMonthlyContribution] = useState(200);
  const [annualRate, setAnnualRate] = useState(7);
  const [years, setYears] = useState(30);

  const data = useMemo(() => {
    onInteract();

    const monthlyRate = annualRate / 100 / 12;
    const result = [];
    let totalSimple = principal;
    let totalCompound = principal;

    for (let year = 0; year <= years; year++) {
      // Simple interest calculation (for comparison)
      totalSimple =
        principal +
        monthlyContribution * 12 * year +
        principal * (annualRate / 100) * year +
        (monthlyContribution * 12 * year * (annualRate / 100) * year) / 2;

      // Compound interest calculation
      if (year === 0) {
        totalCompound = principal;
      } else {
        totalCompound = principal * Math.pow(1 + monthlyRate, 12 * year);
        // Add monthly contributions with compound growth
        if (monthlyContribution > 0) {
          const monthlyCompoundGrowth =
            monthlyContribution * ((Math.pow(1 + monthlyRate, 12 * year) - 1) / monthlyRate);
          totalCompound += monthlyCompoundGrowth;
        }
      }

      result.push({
        year,
        compound: Math.round(totalCompound),
        simple: Math.round(totalSimple),
        difference: Math.round(totalCompound - totalSimple),
      });
    }

    return result;
  }, [principal, monthlyContribution, annualRate, years, onInteract]);

  const finalAmount = data[data.length - 1]?.compound || 0;
  const totalContributions = principal + monthlyContribution * 12 * years;
  const totalGrowth = finalAmount - totalContributions;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">📈 Compound Interest Calculator</CardTitle>
          <CardDescription>See how your money grows over time with the magic of compound interest</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <Label htmlFor="principal">Initial Investment</Label>
                <Input
                  id="principal"
                  type="number"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="monthly">Monthly Contribution</Label>
                <Input
                  id="monthly"
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Annual Return Rate: {annualRate}%</Label>
                <Slider
                  value={[annualRate]}
                  onValueChange={(value) => {
                    if (value[0] !== undefined) {
                      setAnnualRate(value[0]);
                    }
                  }}
                  max={15}
                  min={1}
                  step={0.5}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Investment Period: {years} years</Label>
                <Slider
                  value={[years]}
                  onValueChange={(value) => {
                    if (value[0] !== undefined) {
                      setYears(value[0]);
                    }
                  }}
                  max={40}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h3 className="mb-2 font-semibold text-green-800">Final Amount</h3>
                <p className="text-3xl font-bold text-green-900">${finalAmount.toLocaleString()}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="text-sm text-blue-600">Total Contributions</p>
                  <p className="font-semibold text-blue-900">${totalContributions.toLocaleString()}</p>
                </div>
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                  <p className="text-sm text-orange-600">Total Growth</p>
                  <p className="font-semibold text-orange-900">${totalGrowth.toLocaleString()}</p>
                </div>
              </div>

              <div className="text-sm text-gray-600">
                <p>
                  💡 <strong>Tip:</strong> The longer you invest, the more powerful compound interest becomes!
                </p>
              </div>
            </div>
          </div>

          <div className="h-80">
            <h3 className="mb-4 font-semibold">Growth Over Time</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `$${value.toLocaleString()}`,
                    name === "compound" ? "Compound Interest" : "Simple Interest",
                  ]}
                  labelFormatter={(year) => `Year ${year}`}
                />
                <Line type="monotone" dataKey="compound" stroke="#059669" strokeWidth={3} name="compound" />
                <Line
                  type="monotone"
                  dataKey="simple"
                  stroke="#dc2626"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="simple"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h4 className="mb-2 font-semibold text-yellow-800">Key Insights:</h4>
            <ul className="space-y-1 text-sm text-yellow-700">
              <li>• The green line shows compound interest - your earnings generate their own earnings</li>
              <li>• The red dashed line shows simple interest for comparison</li>
              <li>• Notice how the gap widens over time - that's the magic of compound interest!</li>
              <li>• Starting early and investing consistently maximizes this effect</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
