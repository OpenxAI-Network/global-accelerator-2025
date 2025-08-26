"use client"
import { useState } from 'react'
import { simState, type PollutionParams, type SimulationMode, addHistory, resetState } from '@/lib/state'
import { useSnapshot } from 'valtio'
import { motion } from 'framer-motion'

const slider = (
  label: string,
  value: number,
  min: number,
  max: number,
  step: number,
  onChange: (v: number) => void,
) => (
  <div className="mb-3">
    <div className="flex items-center justify-between">
      <label className="text-sm text-zinc-600 dark:text-zinc-300">{label}</label>
      <span className="text-xs text-zinc-500">{value.toFixed(2)}</span>
    </div>
    <input type="range" className="w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
  </div>
)

export default function Controls() {
  const snap = useSnapshot(simState)
  const [nlp, setNlp] = useState('')

  const setParams = (patch: Partial<PollutionParams>) => {
    simState.params = { ...simState.params, ...patch }
  }

  const setMode = (mode: SimulationMode) => {
    simState.mode = mode
    if (mode === 'global') simState.countryCode = null
  }

  const applyNlp = async () => {
    const text = nlp.trim()
    if (!text) return
    try {
      const res = await fetch('/api/llama/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, params: snap.params, year: snap.year, baseYear: snap.baseYear }),
      })
      const data = await res.json()
      if (data?.ok) {
        if (data.params) {
          simState.params = { ...simState.params, ...data.params }
        }
        addHistory(`NLP applied: ${text}`)
      }
    } catch {
      // fallback to rule-based applied below
    }
    let desc = ''
    const lower = text.toLowerCase()
    if (lower.includes('factory') || lower.includes('factories')) {
      setParams({ industrialGrowth: Math.min(20, snap.params.industrialGrowth + 1) })
      desc = 'Increased industrial growth due to factories.'
    }
    if (lower.includes('deforest') || lower.includes('logging')) {
      setParams({ deforestation: Math.min(10, snap.params.deforestation + 0.5) })
      desc = 'Higher deforestation from logging.'
    }
    if (lower.includes('coal') || lower.includes('emission')) {
      setParams({ co2Emissions: Math.min(100, snap.params.co2Emissions + 2) })
      desc = 'Raised CO₂ emissions.'
    }
    if (lower.includes('renewable') || lower.includes('solar') || lower.includes('wind')) {
      setParams({ co2Emissions: Math.max(0, snap.params.co2Emissions - 2) })
      desc = 'Lowered CO₂ via renewables.'
    }
    if (lower.includes('population')) {
      setParams({ populationGrowth: Math.min(5, snap.params.populationGrowth + 0.2) })
      desc = 'Population growth increased.'
    }
    if (lower.includes('india')) {
      simState.mode = 'country'
      simState.countryCode = 'IN'
      desc = desc || 'Targeting India (country mode).'
    }
    if (desc) addHistory(desc)
    setNlp('')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="w-full md:w-96 bg-white/70 dark:bg-zinc-900/60 backdrop-blur rounded-xl p-4 border border-white/20 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <motion.button whileTap={{ scale: 0.97 }} className={`px-3 py-1 rounded-md text-sm border ${snap.mode === 'global' ? 'bg-emerald-500 text-white' : 'bg-white/50 dark:bg-zinc-800/50'}`} onClick={() => setMode('global')}>Global</motion.button>
        <motion.button whileTap={{ scale: 0.97 }} className={`px-3 py-1 rounded-md text-sm border ${snap.mode === 'country' ? 'bg-emerald-500 text-white' : 'bg-white/50 dark:bg-zinc-800/50'}`} onClick={() => setMode('country')}>Country</motion.button>
        {snap.mode === 'country' && (
          <input className="ml-2 px-2 py-1 text-sm rounded-md bg-white/70 dark:bg-zinc-800/70 border" placeholder="Country ISO (e.g., IN)" value={snap.countryCode ?? ''} onChange={(e) => (simState.countryCode = e.target.value.toUpperCase())} />
        )}
        <div className="flex-1" />
        <motion.button whileTap={{ scale: 0.97 }} className="px-3 py-1 rounded-md text-sm border" onClick={() => { resetState(); addHistory('State reset to defaults.'); }}>Reset</motion.button>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex items-center gap-2">
          <input id="autorotate" type="checkbox" checked={snap.autoRotate} onChange={(e) => (simState.autoRotate = e.target.checked)} />
          <label htmlFor="autorotate" className="text-sm">Auto-rotate</label>
        </div>
        <div>
          <label className="text-xs text-zinc-500">Spin speed</label>
          <input type="range" min={0} max={0.1} step={0.001} value={snap.rotationSpeed} onChange={(e) => (simState.rotationSpeed = Number(e.target.value))} className="w-full" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div>
          <label className="text-xs text-zinc-500">Target lat</label>
          <input className="w-full px-2 py-1 rounded-md bg-white/70 dark:bg-zinc-800/70 border" type="number" step={0.1} onChange={(e) => {
            const lat = Number(e.target.value);
            const lng = simState.targetLatLng?.lng ?? 0;
            simState.targetLatLng = { lat, lng };
          }} value={snap.targetLatLng?.lat ?? 0} />
        </div>
        <div>
          <label className="text-xs text-zinc-500">Target lng</label>
          <input className="w-full px-2 py-1 rounded-md bg-white/70 dark:bg-zinc-800/70 border" type="number" step={0.1} onChange={(e) => {
            const lng = Number(e.target.value);
            const lat = simState.targetLatLng?.lat ?? 0;
            simState.targetLatLng = { lat, lng };
          }} value={snap.targetLatLng?.lng ?? 0} />
        </div>
      </div>

      {slider('CO₂ emissions (Gt/yr)', snap.params.co2Emissions, 0, 100, 1, (v) => setParams({ co2Emissions: v }))}
      {slider('PM2.5 (µg/m³)', snap.params.pm25, 0, 300, 1, (v) => setParams({ pm25: v }))}
      {slider('Deforestation (%/yr)', snap.params.deforestation, 0, 10, 0.1, (v) => setParams({ deforestation: v }))}
      {slider('Ocean acidification (ΔpH)', snap.params.oceanAcidification, 0, 1, 0.01, (v) => setParams({ oceanAcidification: v }))}
      {slider('Industrial growth (%/yr)', snap.params.industrialGrowth, 0, 20, 0.1, (v) => setParams({ industrialGrowth: v }))}
      {slider('Population growth (%/yr)', snap.params.populationGrowth, 0, 5, 0.1, (v) => setParams({ populationGrowth: v }))}

      <div className="mt-4">
        <div className="text-xs text-zinc-500 mb-1">Natural language</div>
        <div className="flex gap-2">
          <input className="flex-1 px-3 py-2 rounded-md bg-white/70 dark:bg-zinc-800/70 border" placeholder="e.g., Add 1000 factories in India" value={nlp} onChange={(e) => setNlp(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && applyNlp()} />
          <motion.button whileTap={{ scale: 0.97 }} className="px-3 py-2 rounded-md bg-emerald-600 text-white" onClick={applyNlp}>Apply</motion.button>
        </div>
      </div>
    </motion.div>
  )
}


