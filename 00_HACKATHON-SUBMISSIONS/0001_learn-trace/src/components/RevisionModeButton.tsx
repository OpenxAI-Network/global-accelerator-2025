"use client";

import { useState } from "react";
import { Brain, Check, X } from "lucide-react";

interface RevisionModeButtonProps {
  isRevisionMode: boolean;
  onToggleRevisionMode: (enabled: boolean) => void;
  selectedNodesCount: number;
  onStartRevision: () => void;
}

export default function RevisionModeButton({ 
  isRevisionMode, 
  onToggleRevisionMode, 
  selectedNodesCount,
  onStartRevision 
}: RevisionModeButtonProps) {
  return (
    <div className="flex items-center space-x-2">
      {!isRevisionMode ? (
        <button
          onClick={() => onToggleRevisionMode(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
        >
          <Brain className="w-4 h-4" />
          <span>Revision Mode</span>
        </button>
      ) : (
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg border border-purple-200">
            <Brain className="w-4 h-4" />
            <span className="text-sm font-medium">
              {selectedNodesCount} selected
            </span>
          </div>
          
          {selectedNodesCount > 0 && (
            <button
              onClick={onStartRevision}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Start Quiz</span>
            </button>
          )}
          
          <button
            onClick={() => onToggleRevisionMode(false)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
