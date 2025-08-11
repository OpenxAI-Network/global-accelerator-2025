import { Calendar, DollarSign, PiggyBank, TrendingUp } from "lucide-react";

import { useAppContext } from "../_context/AppContext";
import { formatCurrency } from "../_utils/calculations";

export function TransactionSummary() {
  const { transactions, totalRoundUp, monthlyAverage } = useAppContext();

  if (transactions.length === 0) return null;

  const stats = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      label: "Total Transactions",
      value: transactions.length.toLocaleString(),
      color: "text-blue-600 bg-blue-100",
    },
    {
      icon: <PiggyBank className="h-6 w-6" />,
      label: "Total Round-Up",
      value: formatCurrency(totalRoundUp),
      color: "text-emerald-600 bg-emerald-100",
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      label: "Monthly Average",
      value: formatCurrency(monthlyAverage),
      color: "text-amber-600 bg-amber-100",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      label: "Time Period",
      value: getTimePeriod(transactions),
      color: "text-purple-600 bg-purple-100",
    },
  ];

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <h3 className="mb-6 text-xl font-bold text-gray-900">Your Round-Up Summary</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="rounded-lg border border-gray-100 p-4 transition-shadow hover:shadow-md">
            <div className={`h-12 w-12 rounded-lg ${stat.color} mb-3 flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div className="mb-1 text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 p-4">
        <div className="text-center">
          <p className="text-gray-700">
            Your spare change of <span className="font-bold text-emerald-600">{formatCurrency(totalRoundUp)}</span>{" "}
            could grow to
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-600">
            {formatCurrency(monthlyAverage * 12 * 10 * 1.07 ** 10)} in 10 years
          </p>
          <p className="mt-1 text-sm text-gray-600">with moderate 7% annual returns</p>
        </div>
      </div>
    </div>
  );
}

interface Transaction {
  date: string;
}

function getTimePeriod(transactions: Transaction[]): string {
  if (!transactions?.length) return "No data";

  const dates = transactions.map((t) => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());

  if (!dates.length) return "No data";

  const earliest = dates[0];
  const latest = dates[dates.length - 1];

  if (!earliest || !latest) return "Invalid dates";

  const monthsDiff =
    (latest.getFullYear() - earliest.getFullYear()) * 12 + (latest.getMonth() - earliest.getMonth()) + 1;

  if (monthsDiff === 1) return "1 month";
  if (monthsDiff < 12) return `${monthsDiff} months`;

  const years = Math.floor(monthsDiff / 12);
  const remainingMonths = monthsDiff % 12;

  if (remainingMonths === 0) return `${years} year${years > 1 ? "s" : ""}`;
  return `${years}y ${remainingMonths}m`;
}
