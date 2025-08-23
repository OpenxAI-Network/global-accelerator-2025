"use client";

import { EducationalContent } from "./_components/EducationContent";
import { ErrorMessage } from "./_components/ErrorMessage";
import { FileUpload } from "./_components/FileUpload";
import { GrowthChart } from "./_components/GrowthChart";
import { Header } from "./_components/Header";
import { LoadingSpinner } from "./_components/LoadingSpinner";
import { TransactionSummary } from "./_components/TransactinSummary";
import { TransactionList } from "./_components/TransactionList";
import { AppProvider, useAppContext } from "./_context/AppContext";

function AppContent() {
  const { transactions, isLoading } = useAppContext();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorMessage />

        {isLoading && <LoadingSpinner message="Processing your transaction data..." />}

        {!transactions.length && !isLoading && (
          <div className="space-y-8">
            <FileUpload />
            <EducationalContent />
          </div>
        )}

        {transactions.length > 0 && !isLoading && (
          <div className="space-y-8">
            <TransactionSummary />
            <GrowthChart />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <TransactionList />
              <EducationalContent />
            </div>

            <div className="py-8 text-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-6 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
              >
                Start Over
              </button>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-16 bg-gray-900 py-8 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-gray-400">
            Built for financial education. Always consult with a financial advisor for personalized advice.
          </p>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
