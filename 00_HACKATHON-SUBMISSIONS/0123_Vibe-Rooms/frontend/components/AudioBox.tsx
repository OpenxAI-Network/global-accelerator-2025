"use client";

import { useEffect, useRef } from "react";

type Layer = { url: string; volume: number };

export default function AudioBox({
  layers,
  setLayers,
}: {
  layers: Layer[];
  setLayers: (layers: Layer[]) => void;
}) {
  const audioRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  const ensure = (url: string) => {
    let a = audioRefs.current.get(url);
    if (!a) {
      a = new Audio(url);
      a.loop = true;
      a.volume = 0.3;
      audioRefs.current.set(url, a);
    }
    return a;
  };

  const stopAll = () => {
    audioRefs.current.forEach((a) => { a.pause(); a.currentTime = 0; });
    // keep refs so re-adding is fast; they’ll be reused/overwritten
  };

  useEffect(() => {
    if (layers.length === 0) { stopAll(); return; }
    // play/adjust according to current state
    layers.forEach(({ url, volume }) => {
      const a = ensure(url);
      a.volume = Math.max(0, Math.min(1, volume));
      if (volume > 0) a.play().catch(() => {}); else a.pause();
    });
    // pause any audios no longer present
    Array.from(audioRefs.current.keys()).forEach((url) => {
      if (!layers.some((l) => l.url === url)) {
        const a = audioRefs.current.get(url)!;
        a.pause(); a.currentTime = 0;
        audioRefs.current.delete(url);
      }
    });
  }, [layers]);

  const setVol = (i: number, v: number) => {
    const ls = [...layers]; ls[i] = { ...ls[i], volume: v }; setLayers(ls);
  };
  const toggleMute = (i: number) => setVol(i, layers[i].volume === 0 ? 0.3 : 0);
  const remove = (i: number) => {
    const u = layers[i].url; const a = audioRefs.current.get(u);
    if (a) { a.pause(); a.currentTime = 0; audioRefs.current.delete(u); }
    setLayers(layers.filter((_, idx) => idx !== i));
  };

  return (
    <section className="bg-neutral-900/85 text-white p-6 rounded-2xl shadow-xl space-y-4">
      {layers.map((l, i) => {
        const file = l.url.split("/").pop() || l.url;
        return (
          <div key={l.url + i} className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3">
            <div className="truncate text-sm">{file}</div>
            <input
              type="range" min={0} max={1} step={0.01}
              value={l.volume}
              onChange={(e) => setVol(i, parseFloat(e.target.value))}
              className="accent-white"
            />
            <button onClick={() => toggleMute(i)} className="px-2 py-1 rounded border border-white/25 hover:bg-white/10">
              {l.volume === 0 ? "Unmute" : "Mute"}
            </button>
            <button onClick={() => remove(i)} className="px-2 py-1 rounded border border-white/25 hover:bg-white/10">
              Remove
            </button>
          </div>
        );
      })}
      {layers.length === 0 && <div className="text-sm text-white/70">No layers loaded.</div>}
    </section>
  );
}
