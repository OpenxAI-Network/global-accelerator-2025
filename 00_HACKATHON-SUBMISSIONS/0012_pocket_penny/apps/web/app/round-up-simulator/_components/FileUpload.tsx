import React, { useCallback } from "react";

import { AlertCircle, FileText, Upload } from "lucide-react";

import { useAppContext } from "../_context/AppContext";
import { generateSampleData, parseCSV } from "../_utils/csvParser";

export function FileUpload() {
  const { setTransactions, setLoading, setError, isLoading } = useAppContext();

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Please upload a CSV file");
        return;
      }

      setLoading(true);
      try {
        const transactions = await parseCSV(file);
        setTransactions(transactions);
      } catch (error) {
        setError(error instanceof Error ? error.message : "Failed to process file");
      }
    },
    [setTransactions, setLoading, setError]
  );

  const handleUseSampleData = () => {
    const sampleData = generateSampleData();
    setTransactions(sampleData);
  };

  return (
    <div className="rounded-xl bg-white p-8 shadow-lg">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <Upload className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Upload Your Transaction Data</h2>
        <p className="mb-6 text-gray-600">
          Upload a CSV file of your bank transactions to see how round-up investments could grow your savings
        </p>

        <div className="space-y-4">
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isLoading}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className={`inline-flex cursor-pointer items-center rounded-lg border-2 border-dashed border-emerald-300 px-6 py-3 transition-colors hover:border-emerald-400 hover:bg-emerald-50 ${
                isLoading ? "cursor-not-allowed opacity-50" : ""
              }`}
            >
              <FileText className="mr-2 h-5 w-5 text-emerald-600" />
              <span className="font-medium text-emerald-600">{isLoading ? "Processing..." : "Choose CSV File"}</span>
            </label>
          </div>

          <div className="text-sm text-gray-500">or</div>

          <button
            onClick={handleUseSampleData}
            disabled={isLoading}
            className="inline-flex items-center rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Try Sample Data
          </button>
        </div>

        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <div className="flex items-start">
            <AlertCircle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="text-left text-sm text-blue-800">
              <p className="mb-1 font-medium">CSV Format Requirements:</p>
              <ul className="space-y-1 text-blue-700">
                <li>• Must include columns: Date, Description, Amount</li>
                <li>• Date format: MM/DD/YYYY or YYYY-MM-DD</li>
                <li>• Amount should be positive numbers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
