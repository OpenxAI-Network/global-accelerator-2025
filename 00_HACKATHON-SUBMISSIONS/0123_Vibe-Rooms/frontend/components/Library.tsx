"use client";

import { useEffect, useMemo, useState } from "react";

type Layer = { name?: string; url: string };
type PaletteResponse = Record<string, Layer[]>;

const MAX_LAYERS = 6;

function packFromUrl(url: string) {
  // /assets/<pack>/<file>.mp3 -> <pack>
  const parts = url.split("/");
  return parts.length >= 4 ? parts[2] : "pack";
}

export default function Library({
  onAdd,
  currentCount,
}: {
  onAdd: (l: { url: string; volume: number }) => void;
  currentCount: number;
}) {
  const api = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";
  const [data, setData] = useState<PaletteResponse>({});
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch(`${api}/palette`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({}));
  }, [api]);

  const flat: Layer[] = useMemo(() => {
    const items = Object.values(data).flat();
    return items.sort((a, b) => {
      const an = (a.url.split("/").pop() || a.url).toLowerCase();
      const bn = (b.url.split("/").pop() || b.url).toLowerCase();
      return an.localeCompare(bn);
    });
  }, [data]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return flat;
    return flat.filter((x) => {
      const fn = (x.url.split("/").pop() || x.url).toLowerCase();
      return fn.includes(s);
    });
  }, [flat, q]);

  const canAdd = currentCount < MAX_LAYERS;

  return (
    <section className="bg-neutral-900/85 text-white backdrop-blur-lg rounded-2xl shadow-xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="text-xl font-bold mr-auto">Library</div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search sounds…"
          className="px-3 py-2 rounded-lg border border-white/20 bg-neutral-800 text-white placeholder-white/60 w-56"
        />
        <div className="text-sm text-white/70">
          Selected: {currentCount}/{MAX_LAYERS}
        </div>
      </div>

      <div className="max-h-72 overflow-auto pr-1">
        {filtered.length === 0 && (
          <div className="text-sm text-white/75">No items.</div>
        )}

        <ul className="space-y-1">
          {filtered.map((it) => {
            const file = it.url.split("/").pop() || it.url;
            const pack = packFromUrl(it.url);
            return (
              <li
                key={it.url}
                className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2 bg-white/5 hover:bg-white/8 transition"
              >
                <div className="min-w-0 flex items-center gap-2">
                  <span className="inline-block text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                    {pack}
                  </span>
                  <span className="truncate text-sm">{file}</span>
                </div>

                <button
                  className={`shrink-0 px-3 py-1.5 rounded-lg border ${
                    canAdd
                      ? "border-white/20 bg-white text-black hover:bg-white/90"
                      : "border-white/15 bg-white/10 text-white/50 cursor-not-allowed"
                  }`}
                  onClick={() => {
                    if (canAdd) onAdd({ url: it.url, volume: 0.3 });
                  }}
                >
                  + Add
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
