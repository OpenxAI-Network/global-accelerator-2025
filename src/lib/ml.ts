import * as tf from '@tensorflow/tfjs'
import type { PollutionParams } from './state'

export type Prediction = {
  co2Ppm: number
  temperatureRiseC: number
  seaLevelRiseCm: number
  populationImpact: { humans: number; animals: number; plants: number }
  iceCapMeltPct: number
  oceanPHDelta: number
}

// Lightweight linear model: y = Wx + b with handcrafted weights as a baseline.
// This is structured so we can later replace with a trained tfjs model.
const weights = tf.tensor2d([
  // co2Emissions, pm25, deforestation, oceanAcidification, industrialGrowth, populationGrowth, yearsFromNow
  [1.2, 0.2, 0.4, 0.6, 0.5, 0.3, 0.8], // co2Ppm delta
  [0.02, 0.03, 0.04, 0.015, 0.02, 0.015, 0.03], // temperatureRiseC
  [0.5, 0.2, 0.25, 0.1, 0.2, 0.15, 0.3], // seaLevelRiseCm
  [0.1, 0.2, 0.25, 0.05, 0.1, 0.2, 0.05], // humans impact index
  [0.1, 0.15, 0.3, 0.05, 0.1, 0.1, 0.05], // animals impact index
  [0.1, 0.1, 0.35, 0.05, 0.1, 0.1, 0.05], // plants impact index
  [0.0, 0.0, 0.0, 0.8, 0.0, 0.0, 0.1], // ocean pH delta
  [0.0, 0.0, 0.15, 0.0, 0.0, 0.0, 0.03], // iceCapMeltPct
])

const bias = tf.tensor1d([415, 0.8, 0, 0.1, 0.1, 0.1, 0.0, 5])

export function predictMetrics(params: PollutionParams, baseYear: number, year: number): Prediction {
  const yearsFromNow = Math.max(0, year - baseYear)
  const input = tf.tensor2d([
    [
      params.co2Emissions,
      params.pm25,
      params.deforestation,
      params.oceanAcidification,
      params.industrialGrowth,
      params.populationGrowth,
      yearsFromNow,
    ],
  ])

  const raw = input.matMul(weights.transpose()).add(bias)
  const arr = raw.arraySync() as number[][]
  const [co2Ppm, temperatureRiseC, seaLevelRiseCm, humansIdx, animalsIdx, plantsIdx, oceanPHDelta, iceCapMeltPct] = arr[0]

  // Clamp and scale impacts into interpretable ranges
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))
  const prediction: Prediction = {
    co2Ppm: clamp(co2Ppm, 350, 1200),
    temperatureRiseC: clamp(temperatureRiseC, 0, 5.5),
    seaLevelRiseCm: clamp(seaLevelRiseCm, 0, 200),
    populationImpact: {
      humans: clamp(humansIdx, 0, 1),
      animals: clamp(animalsIdx, 0, 1),
      plants: clamp(plantsIdx, 0, 1),
    },
    iceCapMeltPct: clamp(iceCapMeltPct, 0, 100),
    oceanPHDelta: clamp(oceanPHDelta, 0, 1.2),
  }

  tf.dispose([input, raw])
  return prediction
}


