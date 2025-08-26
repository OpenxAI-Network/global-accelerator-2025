import { proxy, subscribe } from 'valtio'

export type SimulationMode = 'global' | 'country'

export type PollutionParams = {
  co2Emissions: number // gigatonnes/year (0-100)
  pm25: number // micrograms/m3 (0-300)
  deforestation: number // % forest lost per year (0-10)
  oceanAcidification: number // delta pH (0-1)
  industrialGrowth: number // % growth (0-20)
  populationGrowth: number // % growth (0-5)
}

export type SimulationState = {
  mode: SimulationMode
  countryCode: string | null
  year: number
  baseYear: number
  params: PollutionParams
  history: Array<{ timestamp: number; description: string }>
  autoRotate: boolean
  rotationSpeed: number
  targetLatLng: { lat: number; lng: number } | null
}

export const defaultParams: PollutionParams = {
  co2Emissions: 36,
  pm25: 25,
  deforestation: 0.3,
  oceanAcidification: 0.1,
  industrialGrowth: 3,
  populationGrowth: 1.1,
}

export const simState = proxy<SimulationState>({
  mode: 'global',
  countryCode: null,
  year: 2025,
  baseYear: 2025,
  params: { ...defaultParams },
  history: [],
  autoRotate: true,
  rotationSpeed: 0.02,
  targetLatLng: null,
})

export function resetState() {
  simState.mode = 'global'
  simState.countryCode = null
  simState.year = simState.baseYear
  simState.params = { ...defaultParams }
  simState.history = []
  simState.autoRotate = true
  simState.rotationSpeed = 0.02
  simState.targetLatLng = null
}

export function addHistory(description: string) {
  simState.history.unshift({ timestamp: Date.now(), description })
}

// Persist to localStorage lightly (best-effort)
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('envsim-state')
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<SimulationState>
      Object.assign(simState, parsed)
    }
  } catch {}

  subscribe(simState, () => {
    try {
      localStorage.setItem(
        'envsim-state',
        JSON.stringify({
          mode: simState.mode,
          countryCode: simState.countryCode,
          year: simState.year,
          baseYear: simState.baseYear,
          params: simState.params,
        })
      )
    } catch {}
  })
}


