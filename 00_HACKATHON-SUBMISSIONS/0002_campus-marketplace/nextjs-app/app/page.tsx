"use client";

import { Marketplace } from "@/components/marketplace";
import { AuthPage } from "@/components/auth-page";
import { useAuth } from "@/components/auth-context";
import React from "react";

function AppContent() {
  const { user, loading, networkError, clearNetworkError } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {networkError && (
        <div className="bg-red-500 text-white p-4 text-center relative">
          <p>{networkError}</p>
          <button onClick={clearNetworkError} className="absolute top-2 right-2 text-white">
            &times;
          </button>
        </div>
      )}
      {!user ? <AuthPage /> : <Marketplace />}
    </div>
  );
}

export default function IndexPage() {
  return (
    <AppContent />
  );
}
