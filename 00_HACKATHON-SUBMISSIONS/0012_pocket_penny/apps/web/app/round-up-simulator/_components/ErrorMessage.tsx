import { AlertCircle, X } from "lucide-react";

import { useAppContext } from "../_context/AppContext";

export function ErrorMessage() {
  const { error, setError } = useAppContext();

  if (!error) return null;

  return (
    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start">
        <AlertCircle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
        <div className="flex-1">
          <p className="font-medium text-red-800">Error</p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
        </div>
        <button onClick={() => setError(null)} className="ml-2 text-red-600 hover:text-red-800">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
