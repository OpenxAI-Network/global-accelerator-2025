import Papa from "papaparse";

import { Transaction } from "../_types";
import { calculateRoundUp, categorizeTransaction } from "./calculations";

export interface CSVRow {
  Date: string;
  Description: string;
  Amount: string;
  [key: string]: string;
}

export function parseCSV(file: File): Promise<Transaction[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const transactions = results.data
            .filter((row) => row.Date && row.Description && row.Amount)
            .map((row, index) => {
              const amount = Math.abs(parseFloat(row.Amount.replace(/[^0-9.-]/g, "")));
              const roundUp = calculateRoundUp(amount);

              return {
                id: `txn-${index}`,
                date: new Date(row.Date).toISOString().split("T")[0],
                amount,
                description: row.Description.trim(),
                category: categorizeTransaction(row.Description),
                roundUp,
              };
            })
            .filter((t) => !isNaN(t.amount) && t.amount > 0);

          if (transactions.length === 0) {
            reject(new Error("No valid transactions found in the CSV file"));
            return;
          }

          resolve(transactions as Transaction[]);
        } catch {
          reject(new Error("Failed to parse CSV file. Please check the format."));
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      },
    });
  });
}

export function generateSampleData(): Transaction[] {
  const sampleTransactions = [
    { date: "2024-01-15", description: "Grocery Store Purchase", amount: 47.23 },
    { date: "2024-01-16", description: "Coffee Shop", amount: 4.75 },
    { date: "2024-01-17", description: "Gas Station", amount: 32.89 },
    { date: "2024-01-18", description: "Restaurant Dinner", amount: 28.5 },
    { date: "2024-01-19", description: "Online Shopping", amount: 15.99 },
    { date: "2024-01-20", description: "Pharmacy", amount: 12.34 },
    { date: "2024-01-21", description: "Movie Theater", amount: 16.75 },
    { date: "2024-01-22", description: "Grocery Store", amount: 52.18 },
    { date: "2024-01-23", description: "Coffee Shop", amount: 3.25 },
    { date: "2024-01-24", description: "Gas Station", amount: 38.67 },
  ];

  return sampleTransactions.map((txn, index) => ({
    id: `sample-${index}`,
    date: txn.date,
    amount: txn.amount,
    description: txn.description,
    category: categorizeTransaction(txn.description),
    roundUp: calculateRoundUp(txn.amount),
  }));
}
