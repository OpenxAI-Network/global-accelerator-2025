"use client";

import { useState } from "react";

import { Info, TrendingUp } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useAppContext } from "../_context/AppContext";
import { formatCurrency } from "../_utils/calculations";

export function GrowthChart() {
  const { projections, monthlyAverage } = useAppContext();
  const [selectedTimeframe, setSelectedTimeframe] = useState<1 | 5 | 10 | 20>(10);
  const [showTooltip, setShowTooltip] = useState(false);

  if (projections.length === 0) return null;

  const chartData = projections.filter((p) => p.year <= selectedTimeframe);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
          <p className="mb-2 font-medium text-gray-900">{`Year ${label}`}</p>
          {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100">
            <TrendingUp className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Growth Projections</h3>
            <p className="text-gray-600">See how your {formatCurrency(monthlyAverage)}/month could grow</p>
          </div>
        </div>

        <div className="relative">
          <button
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Info className="h-5 w-5" />
          </button>
          {showTooltip && (
            <div className="absolute right-0 top-8 z-10 w-64 rounded-lg bg-gray-900 p-3 text-sm text-white">
              Projections assume monthly contributions equal to your current round-up average. Conservative: 3%,
              Moderate: 7%, Aggressive: 10% annual returns.
            </div>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {[1, 5, 10, 20].map((years) => (
          <button
            key={years}
            onClick={() => setSelectedTimeframe(years as 1 | 5 | 10 | 20)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedTimeframe === years ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {years} Year{years > 1 ? "s" : ""}
          </button>
        ))}
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} tickFormatter={(value) => `Year ${value}`} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="principal"
              stroke="#6b7280"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="Principal (your contributions)"
            />
            <Line
              type="monotone"
              dataKey="conservative"
              stroke="#059669"
              strokeWidth={3}
              name="Conservative (3% return)"
            />
            <Line type="monotone" dataKey="moderate" stroke="#0ea5e9" strokeWidth={3} name="Moderate (7% return)" />
            <Line
              type="monotone"
              dataKey="aggressive"
              stroke="#f59e0b"
              strokeWidth={3}
              name="Aggressive (10% return)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { key: "conservative", label: "Conservative", color: "emerald", rate: "3%" },
          { key: "moderate", label: "Moderate", color: "blue", rate: "7%" },
          { key: "aggressive", label: "Aggressive", color: "amber", rate: "10%" },
        ].map((scenario) => {
          const finalValue = chartData[chartData.length - 1]?.[scenario.key as keyof (typeof chartData)[0]] || 0;
          const principal = chartData[chartData.length - 1]?.principal || 0;
          const growth = finalValue - principal;

          return (
            <div
              key={scenario.key}
              className={`rounded-lg border-2 p-4 border-${scenario.color}-200 bg-${scenario.color}-50`}
            >
              <div className="text-center">
                <div className={`text-lg font-bold text-${scenario.color}-800`}>
                  {scenario.label} ({scenario.rate})
                </div>
                <div className={`text-2xl font-bold text-${scenario.color}-900 mt-1`}>{formatCurrency(finalValue)}</div>
                <div className="mt-1 text-sm text-gray-600">Growth: {formatCurrency(growth)}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
