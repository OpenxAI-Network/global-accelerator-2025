"use client";
import GlobeCanvas from "@/components/Globe";
import MetricsPanel from "@/components/MetricsPanel";
import Controls from "@/components/Controls";
import Timeline from "@/components/Timeline";
import HistoryPanel from "@/components/HistoryPanel";
import { simState } from "@/lib/state";
import { predictMetrics, type Prediction } from "@/lib/ml";
import { useEffect, useMemo, useState } from "react";
import { useSnapshot } from "valtio";

export default function Home() {
  const snap = useSnapshot(simState);
  const [prediction, setPrediction] = useState<Prediction>(() => predictMetrics(snap.params, snap.baseYear, snap.year));

  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/llama/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ params: snap.params, year: snap.year, baseYear: snap.baseYear }),
          signal: controller.signal,
        });
        const data = await res.json();
        if (data?.ok && data?.prediction) {
          setPrediction(data.prediction as Prediction);
        } else {
          setPrediction(predictMetrics(snap.params, snap.baseYear, snap.year));
        }
      } catch {
        setPrediction(predictMetrics(snap.params, snap.baseYear, snap.year));
      }
    }, 200);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [snap.params, snap.year, snap.baseYear]);

  const pollutionVisual = useMemo(() => {
    const t = Math.min(1, prediction.temperatureRiseC / 4);
    const p = Math.min(1, snap.params.pm25 / 150);
    const d = Math.min(1, snap.params.deforestation / 5);
    return Math.max(0, Math.min(1, (t + p + d) / 3));
  }, [prediction.temperatureRiseC, snap.params.pm25, snap.params.deforestation]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-50 to-emerald-50 dark:from-zinc-900 dark:to-black">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4 p-4 md:p-6">
        <div className="rounded-2xl overflow-hidden bg-black/30 aspect-video lg:aspect-auto min-h-[60vh]">
          <GlobeCanvas pollutionIndex={pollutionVisual} iceMeltPct={prediction.iceCapMeltPct} oceanAcid={prediction.oceanPHDelta} />
        </div>
        <div className="flex flex-col gap-4">
          <MetricsPanel prediction={prediction} />
          <Controls />
          <Timeline year={snap.year} min={2025} max={2050} onChange={(y) => (simState.year = y)} />
          <HistoryPanel />
        </div>
      </div>
    </div>
  );
}
