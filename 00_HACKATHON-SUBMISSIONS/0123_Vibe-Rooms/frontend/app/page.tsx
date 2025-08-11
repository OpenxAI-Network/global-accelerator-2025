// frontend/app/page.tsx
"use client";

import { useRef, useState } from "react";
import AudioBox from "@/components/AudioBox";
import Library from "@/components/Library";

type Layer = { url: string; volume: number };
type LogItem = { when: string; text: string; result: string };

type Plan = {
  label: string;
  description: string;
  background_url: string;
  room: string;
  layers: Layer[];
  timeline: Array<any>;
  context: { goal: string; duration_min: number };
};

export default function Page() {
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

  const [text, setText] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [layers, _setLayers] = useState<Layer[]>([]);
  const layersRef = useRef<Layer[]>([]);
  const setLayers = (ls: Layer[]) => { layersRef.current = ls; _setLayers(ls); };

  const [micOn, setMicOn] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const sceneReady = useRef(false);

  const [log, setLog] = useState<LogItem[]>([]);
  const addLog = (text: string, result: string) =>
    setLog((prev) => [{ when: new Date().toLocaleTimeString(), text, result }, ...prev].slice(0, 2));

  // ---- Adaptive Composer UI state ----
  const [goal, setGoal] = useState("deep work");
  const [minutes, setMinutes] = useState(25);
  const planRef = useRef<Plan | null>(null);
  const timersRef = useRef<number[]>([]);
  const [sessionActive, setSessionActive] = useState(false);

  const bgStyle: React.CSSProperties = {
    position: "fixed", inset: 0,
    backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
    backgroundSize: "cover", backgroundPosition: "center", zIndex: -1,
  };
  const overlayStyle: React.CSSProperties = {
    position: "fixed", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.45), rgba(0,0,0,0.55))", zIndex: -1,
  };

  const loadVibe = async (q: string) => {
    if (!q.trim()) return;
    const r = await fetch(`${backend}/vibe`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: q })
    });
    const d = await r.json();
    const ls = (d.layers || []).slice(0, 6).map((x: any) => ({ url: x.url, volume: x.volume ?? 0.3 }));
    setLabel(d.label || ""); setDescription(d.description || ""); setBackgroundUrl(d.background_url || "");
    setLayers(ls); sceneReady.current = ls.length > 0;
    addLog(q, `Loaded scene "${d.label}" with ${ls.length} layers`);
  };

  const summarize = (d: any) => {
    const bits: string[] = [];
    if (d?.volume_updates?.length) bits.push(`vol ${d.volume_updates.map((u: any)=>`${u.target}->${u.volume}`).join(", ")}`);
    if (d?.toggle?.length)         bits.push(`toggle ${d.toggle.map((t: any)=>`${t.target}:${t.state}`).join(", ")}`);
    if (d?.remove?.length)         bits.push(`remove ${d.remove.map((r: any)=>r.target).join(", ")}`);
    if (d?.add?.length)            bits.push(`add ${d.add.map((a: any)=>`${a.url.split("/").pop()}:${a.volume}`).join(", ")}`);
    return bits.join(" | ") || "no change";
  };

  const runCommand = async (cmd: string) => {
    const current = layersRef.current;
    const r = await fetch(`${backend}/command`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: cmd, layers: current }),
    });
    const d = await r.json();

    // scene switch
    if (d.switch_room) {
      const phrase = `I want to be in the ${d.switch_room}`;
      await loadVibe(phrase);
      addLog(cmd, `→ switched to ${d.switch_room}`);
      return;
    }

    let changed = false;
    let next = [...current];

    (d.volume_updates || []).forEach((u: any) => {
      let hit = false;
      next = next.map((l) => {
        if (l.url.endsWith(u.target)) { hit = true; return { ...l, volume: Math.max(0, Math.min(1, Number(u.volume))) }; }
        return l;
      });
      if (hit) changed = true;
    });

    (d.toggle || []).forEach((t: any) => {
      let hit = false;
      next = next.map((l) => {
        if (l.url.endsWith(t.target)) { hit = true; return { ...l, volume: t.state === "off" ? 0 : (l.volume || 0.3) }; }
        return l;
      });
      if (hit) changed = true;
    });

    if (d.remove?.length) {
      const before = next.length;
      d.remove.forEach((rm: any) => { next = next.filter((l) => !l.url.endsWith(rm.target)); });
      if (next.length !== before) changed = true;
    }

    if (d.add?.length) {
      d.add.forEach((ad: any) => {
        if (ad?.url && next.length < 6 && !next.some((l) => l.url === ad.url)) {
          next.push({ url: ad.url, volume: ad.volume ?? 0.3 });
          changed = true;
        }
      });
    }

    addLog(cmd, summarize(d));
    if (changed) setLayers(next);
  };

  // -------- Adaptive Composer client executor --------
  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };

  function fadeVolume(targetFile: string, to: number, sec: number) {
    const steps = Math.max(1, Math.floor(sec * 20)); // ~20 Hz
    const start = layersRef.current.find((l) => l.url.endsWith(targetFile))?.volume ?? 0.3;
    const delta = (to - start) / steps;
    for (let i = 1; i <= steps; i++) {
      const t = window.setTimeout(() => {
        const cur = layersRef.current.map((l) =>
          l.url.endsWith(targetFile) ? { ...l, volume: Math.max(0, Math.min(1, start + delta * i)) } : l
        );
        setLayers(cur);
      }, (i * 1000 * sec) / steps);
      timersRef.current.push(t);
    }
  }

  function runTimeline(timeline: any[]) {
    clearTimers();
    setSessionActive(true);

    timeline.forEach((ev: any) => {
      const tid = window.setTimeout(() => {
        if (ev.op === "fade") {
          fadeVolume(ev.target, Number(ev.to ?? 0.25), Number(ev.sec ?? 20));
        } else if (ev.op === "fade_all") {
          const to = Number(ev.to ?? 0.2), sec = Number(ev.sec ?? 20);
          layersRef.current.forEach((l) => fadeVolume(l.url.split("/").pop()!, to, sec));
        } else if (ev.op === "add" && ev.url) {
          if (layersRef.current.length < 6 && !layersRef.current.some((l) => l.url === ev.url)) {
            setLayers([...layersRef.current, { url: ev.url, volume: Number(ev.volume ?? 0.22) }]);
          }
        } else if (ev.op === "remove" && ev.target) {
          setLayers(layersRef.current.filter((l) => !l.url.endsWith(ev.target)));
        } else if (ev.op === "stop") {
          setSessionActive(false);
        }
      }, Math.max(0, Number(ev.t) * 1000));
      timersRef.current.push(tid);
    });
  }

  async function startSession() {
    const r = await fetch(`${backend}/compose`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, duration_min: minutes }),
    });
    const plan: Plan = await r.json();
    planRef.current = plan;

    setLabel(plan.label || "");
    setDescription(plan.description || "");
    setBackgroundUrl(plan.background_url || "");
    setLayers((plan.layers || []).slice(0, 6));
    sceneReady.current = true;

    addLog(`Compose: ${goal} (${minutes}m)`, `Loaded plan in ${plan.room}`);
    runTimeline(plan.timeline || []);
  }

  function stopSession() {
    clearTimers();
    setSessionActive(false);
  }

  // -------- Speech recognition --------
  const startMic = () => {
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Speech recognition not supported in this browser."); return; }
    const rec: SpeechRecognition = new SR();
    rec.continuous = true; rec.interimResults = false; rec.lang = "en-US";
    rec.onend = () => { if (micOn) rec.start(); };
    rec.onresult = (e) => {
      const tx = e.results[e.results.length - 1][0].transcript.trim();
      if (!tx) return; setText(tx);
      if (!sceneReady.current) loadVibe(tx); else runCommand(tx);
    };
    recognitionRef.current = rec; rec.start();
  };
  const stopMic = () => recognitionRef.current?.stop();
  const toggleMic = () => { if (micOn) { setMicOn(false); stopMic(); } else { setMicOn(true); startMic(); } };

  return (
    <main className="min-h-screen text-white p-6">
      <div style={bgStyle}></div><div style={overlayStyle}></div>

      <div className="flex items-center gap-3 mb-6">
        <input value={text} onChange={(e)=>setText(e.target.value)}
          placeholder="Where do you want to be? (e.g., mountain, cafe, forest at night)"
          className="px-3 py-2 rounded-lg border border-white/20 bg-neutral-900/80 text-white placeholder-white/60 flex-1" />
        <button onClick={()=>loadVibe(text)} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90">Go</button>
        <button
          onClick={toggleMic}
          className={`px-4 py-2 rounded-lg ${micOn ? "bg-red-500 hover:bg-red-600" : "bg-white text-black hover:bg-white/90"}`}
        >
          {micOn ? "Stop Mic" : "Start Mic"}
        </button>
      </div>

      {label && (<div className="mb-4"><h1 className="text-2xl font-bold">{label}</h1><p className="text-white/80">{description}</p></div>)}

      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.9fr_0.75fr] gap-6">
        <AudioBox layers={layers} setLayers={(ls)=>{ setLayers(ls); sceneReady.current = ls.length>0; }} />

        <Library onAdd={(l)=>{ if (layersRef.current.length < 6) setLayers([...layersRef.current, l]); }} currentCount={layersRef.current.length} />

        <section className="flex flex-col gap-4 max-h-[520px]">
          {/* Adaptive Focus Session panel */}
          <section className="bg-neutral-900/85 text-white backdrop-blur-lg rounded-2xl shadow-xl p-4 flex flex-col gap-3">
            <div className="text-xl font-bold">Focus Session (Adaptive)</div>
            <div className="flex items-center gap-2">
              <input
                value={goal}
                onChange={(e)=>setGoal(e.target.value)}
                placeholder="e.g., deep work, reading, relax"
                className="px-3 py-2 rounded-lg border border-white/20 bg-neutral-800 text-white placeholder-white/60 flex-1"
              />
              <input
                type="number" min={5} max={120} value={minutes}
                onChange={(e)=>setMinutes(parseInt(e.target.value||"25",10))}
                className="w-20 px-3 py-2 rounded-lg border border-white/20 bg-neutral-800 text-white"
              />
              {!sessionActive ? (
                <button onClick={startSession} className="px-3 py-2 rounded-lg bg-white text-black hover:bg-white/90">Start</button>
              ) : (
                <button onClick={stopSession} className="px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600">Stop</button>
              )}
            </div>
          </section>

          {/* Voice commands + log */}
          <section className="bg-neutral-900/85 text-white backdrop-blur-lg rounded-2xl shadow-xl p-4 flex flex-col gap-4">
            <div>
              <div className="text-xl font-bold mb-2">Voice Commands</div>
              <ul className="text-sm text-white/80 space-y-1 list-disc pl-5">
                <li>“<b>mute</b> birds” / “<b>unmute</b> wind”</li>
                <li>“<b>increase</b> wind to <b>40%</b>” / “<b>decrease</b> birds to <b>0.2</b>”</li>
                <li>“<b>remove</b> footsteps” (also understands “remote/romove”)</li>
                <li>“<b>add</b> campfire at <b>30%</b>”</li>
                <li>“I want to be in a <b>mountain</b> / <b>cafe</b> / <b>forest</b> …” (loads that room)</li>
              </ul>
            </div>
            <div className="border-t border-white/15 pt-3">
              <div className="text-xl font-bold mb-2">Command Log</div>
              <div className="space-y-2">
                {log.length === 0 && <div className="text-sm text-white/60">No commands yet.</div>}
                {log.map((l, i) => (
                  <div key={i} className="text-xs bg-white/5 rounded p-2">
                    <div className="text-white/70">{l.when}</div>
                    <div><span className="text-white/90">You:</span> {l.text}</div>
                    <div className="text-white/80">→ {l.result}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
