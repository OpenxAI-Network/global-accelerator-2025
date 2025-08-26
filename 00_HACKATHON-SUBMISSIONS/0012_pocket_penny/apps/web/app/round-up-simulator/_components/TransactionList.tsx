"use client";

import { useState } from "react";

import { ChevronDown, ChevronUp, Filter } from "lucide-react";

import { useAppContext } from "../_context/AppContext";
import { formatCurrency, formatDate } from "../_utils/calculations";

export function TransactionList() {
  const { transactions } = useAppContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  if (transactions.length === 0) return null;

  const categories = ["all", ...Array.from(new Set(transactions.map((t) => t.category)))];
  const filteredTransactions =
    selectedCategory === "all" ? transactions : transactions.filter((t) => t.category === selectedCategory);

  const displayTransactions = isExpanded ? filteredTransactions : filteredTransactions.slice(0, 5);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Food & Groceries": "bg-green-100 text-green-800",
      Transportation: "bg-blue-100 text-blue-800",
      "Dining Out": "bg-orange-100 text-orange-800",
      Shopping: "bg-purple-100 text-purple-800",
      Entertainment: "bg-pink-100 text-pink-800",
      Other: "bg-gray-100 text-gray-800",
    };
    return colors[category] || colors["Other"];
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Transaction Details</h3>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Filter className="mr-2 h-4 w-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.slice(1).map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {displayTransactions.map((transaction) => (
          <div
            key={transaction.id}
            className="flex items-center justify-between rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
          >
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <div>
                  <div className="font-medium text-gray-900">{transaction.description}</div>
                  <div className="text-sm text-gray-500">{formatDate(transaction.date)}</div>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(transaction.category)}`}
                >
                  {transaction.category}
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="font-medium text-gray-900">{formatCurrency(transaction.amount)}</div>
              <div className="text-sm font-medium text-emerald-600">
                +{formatCurrency(transaction.roundUp)} round-up
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTransactions.length > 5 && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center px-4 py-2 font-medium text-emerald-600 hover:text-emerald-700"
          >
            {isExpanded ? (
              <>
                Show Less <ChevronUp className="ml-1 h-4 w-4" />
              </>
            ) : (
              <>
                Show {filteredTransactions.length - 5} More <ChevronDown className="ml-1 h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
