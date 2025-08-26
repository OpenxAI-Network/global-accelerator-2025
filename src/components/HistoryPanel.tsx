"use client";
import { useSnapshot } from "valtio";
import { simState } from "@/lib/state";
import { motion, AnimatePresence } from "framer-motion";

export default function HistoryPanel() {
  const snap = useSnapshot(simState);
  return (
    <div className="w-full bg-white/70 dark:bg-zinc-900/60 backdrop-blur rounded-xl p-4 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold">History</h3>
        <span className="text-xs text-zinc-500">{snap.history.length}</span>
      </div>
      <div className="space-y-2 max-h-48 overflow-auto pr-1">
        <AnimatePresence initial={false}>
          {snap.history.map((h) => (
            <motion.div key={h.timestamp} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} className="text-xs rounded-md bg-white/60 dark:bg-zinc-800/60 border border-white/10 p-2">
              <div className="text-zinc-700 dark:text-zinc-300">{h.description}</div>
              <div className="text-[10px] text-zinc-500">{new Date(h.timestamp).toLocaleTimeString()}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}


