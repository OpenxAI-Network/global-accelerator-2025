"use client"
import { motion } from 'framer-motion'

type Props = {
  year: number
  min: number
  max: number
  onChange: (y: number) => void
}

export default function Timeline({ year, min, max, onChange }: Props) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-white/70 dark:bg-zinc-900/60 backdrop-blur rounded-xl p-4 border border-white/20 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-zinc-600 dark:text-zinc-300">Timeline</span>
        <span className="text-sm font-medium">{year}</span>
      </div>
      <input type="range" className="w-full" min={min} max={max} step={1} value={year} onChange={(e) => onChange(Number(e.target.value))} />
      <div className="flex justify-between text-xs text-zinc-500 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </motion.div>
  )
}


