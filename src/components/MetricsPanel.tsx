"use client"
import { motion } from 'framer-motion'
import type { Prediction } from '@/lib/ml'

type Props = {
  prediction: Prediction
}

export default function MetricsPanel({ prediction }: Props) {
  const items: Array<{ label: string; value: string }> = [
    { label: 'CO₂ ppm', value: prediction.co2Ppm.toFixed(0) },
    { label: 'Δ Temp (°C)', value: prediction.temperatureRiseC.toFixed(2) },
    { label: 'Sea-level (cm)', value: prediction.seaLevelRiseCm.toFixed(1) },
    { label: 'Ice melt (%)', value: prediction.iceCapMeltPct.toFixed(1) },
    { label: 'Ocean ΔpH', value: prediction.oceanPHDelta.toFixed(2) },
    { label: 'Impact Humans', value: (prediction.populationImpact.humans * 100).toFixed(0) + '%' },
    { label: 'Impact Animals', value: (prediction.populationImpact.animals * 100).toFixed(0) + '%' },
    { label: 'Impact Plants', value: (prediction.populationImpact.plants * 100).toFixed(0) + '%' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full md:w-80 bg-white/70 dark:bg-zinc-900/60 backdrop-blur rounded-xl p-4 border border-white/20 shadow-xl">
      <h3 className="text-lg font-semibold mb-3">Metrics</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <div key={it.label} className="rounded-lg bg-white/60 dark:bg-zinc-800/60 p-3 border border-white/10">
            <div className="text-xs text-zinc-500">{it.label}</div>
            <div className="text-base font-medium">{it.value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}


