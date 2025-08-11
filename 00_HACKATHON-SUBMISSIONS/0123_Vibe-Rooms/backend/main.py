# backend/main.py

import os, json, random, re, unicodedata
from typing import List, Dict, Any, Tuple, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

ASSETS_BASE = "/assets"
MAX_LAYERS = 6
DEFAULT_VOLS = [0.32, 0.02, 0.22, 0.02, 0.14, 0.06]

PALETTE: Dict[str, List[Dict[str, str]]] = {
    "forest": [
        {"name":"birds.mp3","url":f"{ASSETS_BASE}/forest/birds.mp3"},
        {"name":"campfire.mp3","url":f"{ASSETS_BASE}/forest/campfire.mp3"},
        {"name":"foot-steps.mp3","url":f"{ASSETS_BASE}/forest/foot-steps.mp3"},
        {"name":"leaf.mp3","url":f"{ASSETS_BASE}/forest/leaf.mp3"},
        {"name":"water.mp3","url":f"{ASSETS_BASE}/forest/water.mp3"},
        {"name":"wind.mp3","url":f"{ASSETS_BASE}/forest/wind.mp3"},
    ],
    "ocean": [
        {"name":"wave.mp3","url":f"{ASSETS_BASE}/ocean/wave.mp3"},
        {"name":"wind.mp3","url":f"{ASSETS_BASE}/ocean/wind.mp3"},
        {"name":"seagull.mp3","url":f"{ASSETS_BASE}/ocean/seagull.mp3"},
        {"name":"hum.mp3","url":f"{ASSETS_BASE}/ocean/hum.mp3"},
        {"name":"engine.mp3","url":f"{ASSETS_BASE}/ocean/engine.mp3"},
        {"name":"sail.mp3","url":f"{ASSETS_BASE}/ocean/sail.mp3"},
    ],
    "cafe": [
        {"name":"Chatter.mp3","url":f"{ASSETS_BASE}/cafe/Chatter.mp3"},
        {"name":"Music.mp3","url":f"{ASSETS_BASE}/cafe/Music.mp3"},
        {"name":"Rain.mp3","url":f"{ASSETS_BASE}/cafe/Rain.mp3"},
        {"name":"Espresso machine.mp3","url":f"{ASSETS_BASE}/cafe/Espresso machine.mp3"},
        {"name":"Kitchen.mp3","url":f"{ASSETS_BASE}/cafe/Kitchen.mp3"},
        {"name":"Cash register.mp3","url":f"{ASSETS_BASE}/cafe/Cash register.mp3"},
    ],
    "space": [
        {"name":"drone.mp3","url":f"{ASSETS_BASE}/space/drone.mp3"},
        {"name":"bip.mp3","url":f"{ASSETS_BASE}/space/bip.mp3"},
        {"name":"breath.mp3","url":f"{ASSETS_BASE}/space/breath.mp3"},
        {"name":"fan.mp3","url":f"{ASSETS_BASE}/space/fan.mp3"},
        {"name":"type.mp3","url":f"{ASSETS_BASE}/space/type.mp3"},
        {"name":"space-sound.mp3","url":f"{ASSETS_BASE}/space/space-sound.mp3"},
    ],
    "mountain": [
        {"name":"howling-wind.mp3","url":f"{ASSETS_BASE}/mountain/howling-wind.mp3"},
        {"name":"chimes.mp3","url":f"{ASSETS_BASE}/mountain/chimes.mp3"},
        {"name":"crunching-snow.mp3","url":f"{ASSETS_BASE}/mountain/crunching-snow.mp3"},
        {"name":"ice-cracking.mp3","url":f"{ASSETS_BASE}/mountain/ice-cracking.mp3"},
        {"name":"silence.mp3","url":f"{ASSETS_BASE}/mountain/silence.mp3"},
        {"name":"avalanche.mp3","url":f"{ASSETS_BASE}/mountain/avalanche.mp3"},
    ],
    "desert": [
        {"name":"bazaar.mp3","url":f"{ASSETS_BASE}/desert/bazaar.mp3"},
        {"name":"cricket.mp3","url":f"{ASSETS_BASE}/desert/cricket.mp3"},
        {"name":"dark-background.mp3","url":f"{ASSETS_BASE}/desert/dark-background.mp3"},
        {"name":"foot-steps.mp3","url":f"{ASSETS_BASE}/desert/foot-steps.mp3"},
        {"name":"lizard-eating.mp3","url":f"{ASSETS_BASE}/desert/lizard-eating.mp3"},
        {"name":"sand-storm.mp3","url":f"{ASSETS_BASE}/desert/sand-storm.mp3"},
    ],
}

BACKGROUNDS = {
    "forest": f"{ASSETS_BASE}/forest/forest.gif",
    "ocean": f"{ASSETS_BASE}/ocean/ocean.gif",
    "cafe": f"{ASSETS_BASE}/cafe/cafe.gif",
    "space": f"{ASSETS_BASE}/space/space.gif",
    "mountain": f"{ASSETS_BASE}/mountain/mountain.gif",
    "desert": f"{ASSETS_BASE}/desert/desert.gif",
}

CANDIDATE_LIST = [it for items in PALETTE.values() for it in items]
ALLOWED_URLS = {it["url"] for it in CANDIDATE_LIST}
ROOMS = list(PALETTE.keys())

ROOM_ALIASES = {
    "forest": ["forest", "woods", "jungle"],
    "ocean": ["ocean", "sea", "beach", "waves"],
    "cafe": ["cafe", "coffee", "coffee shop", "café"],
    "space": ["space", "spaceship", "cosmos"],
    "mountain": ["mountain", "alps", "himalaya", "snowy peak", "peaks"],
    "desert": ["desert", "sahara", "dunes", "sand"],
}

def detect_room_from_text(q: str) -> Optional[str]:
    ql = q.lower()
    for room, keys in ROOM_ALIASES.items():
        for k in keys:
            if k in ql:
                return room
    return None

def _norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s).encode("ascii","ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "", s.lower())

def best_match(name: str, candidates: List[str]) -> Tuple[str, float]:
    key = _norm(name)
    best, score = "", 0.0
    for c in candidates:
        k = _norm(c)
        if not k:
            continue
        if key in k or k in key:
            sc = len(key)/len(k) if len(k) else 0.0
            if sc > score:
                best, score = c, sc
    return best, score

def force_layers(raw_layers: List[Dict[str,Any]]) -> List[Dict[str,Any]]:
    clean, seen = [], set()
    for i, it in enumerate(raw_layers or []):
        url = it.get("url","")
        if url in ALLOWED_URLS and url not in seen:
            vol = float(it.get("volume", DEFAULT_VOLS[min(i, len(DEFAULT_VOLS)-1)]))
            clean.append({"url": url, "volume": max(0.10, min(0.50, vol))})
            seen.add(url)
            if len(clean) >= MAX_LAYERS: break
    if not clean:
        sample = random.sample(CANDIDATE_LIST, min(MAX_LAYERS, len(CANDIDATE_LIST)))
        clean = [{"url": s["url"], "volume": DEFAULT_VOLS[i]} for i, s in enumerate(sample)]
    return clean

REMOVE_SYNS = ["remove","delete","del","take out","remote","romove","remuve","rem0ve","rm"]
MUTE_SYNS   = ["mute","turn off","disable","silence"]
UNMUTE_SYNS = ["unmute","turn on","enable"]
UP_SYNS     = ["increase","raise","up","louder","more"]
DOWN_SYNS   = ["decrease","lower","down","softer","less","decreased","reduced","reduce"]
CONTROL_VERBS = REMOVE_SYNS + MUTE_SYNS + UNMUTE_SYNS + UP_SYNS + DOWN_SYNS

def parse_rules(text: str, available_files: List[str]) -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    t = text.strip().lower()
    if not t:
        return out

    m_pct = re.search(r"(\d{1,3})\s*%|(\d(?:\.\d+)?)\s*(?:volume|level)?", t)
    val = None
    if m_pct:
        if m_pct.group(1):
            val = max(0, min(1, int(m_pct.group(1))/100))
        elif m_pct.group(2):
            v = float(m_pct.group(2))
            val = v if v <= 1 else min(1, v/100.0)

    candidates = []
    words = re.findall(r"[a-zA-Z0-9\-]+", t)
    for span in range(len(words), 0, -1):
        for i in range(0, len(words) - span + 1):
            phrase = " ".join(words[i:i+span])
            match, score = best_match(phrase, available_files)
            if match and score > 0:
                candidates.append((match, score))
        if candidates:
            break
    target = max(candidates, key=lambda x: x[1])[0] if candidates else None

    def has_any(keys: List[str]) -> bool:
        return any(k in t for k in keys)

    if not target and has_any(CONTROL_VERBS):
        return {}  # no-op, avoids destructive LLM

    def ensure(key):
        if key not in out: out[key] = []
        return out[key]

    if target:
        if has_any(MUTE_SYNS):
            ensure("toggle").append({"target": target, "state": "off"})
        if has_any(UNMUTE_SYNS):
            ensure("toggle").append({"target": target, "state": "on"})
        if has_any(REMOVE_SYNS):
            out["remove"] = [{"target": target}]
        if has_any(UP_SYNS + DOWN_SYNS):
            if val is None:
                val = 0.4 if has_any(UP_SYNS) else 0.15
            ensure("volume_updates").append({"target": target, "volume": float(val)})

    if "add" in t:
        all_files = [c["name"] for c in CANDIDATE_LIST]
        best, score = ("", 0.0)
        for span in range(len(words), 0, -1):
            for i in range(0, len(words) - span + 1):
                phrase = " ".join(words[i:i+span])
                m, s = best_match(phrase, all_files)
                if s > score: best, score = m, s
        if best:
            url = next((c["url"] for c in CANDIDATE_LIST if c["name"]==best), "")
            if url:
                if val is None: val = 0.3
                out["add"] = [{"url": url, "volume": float(val)}]

    return out

# -------------------- Adaptive Composer (no memory) --------------------

# Tags per file (minimal, hand-written)
FILE_TAGS: Dict[str, set[str]] = {}
def tag(url: str, *tags: str):
    FILE_TAGS[url.split("/")[-1]] = set(t.lower() for t in tags)

# forest
tag("/assets/forest/birds.mp3", "nature","random","relax")
tag("/assets/forest/campfire.mp3", "warm","steady","relax")
tag("/assets/forest/foot-steps.mp3", "random","distracting")
tag("/assets/forest/leaf.mp3", "random","light")
tag("/assets/forest/water.mp3", "smooth","steady","focus","pink-noise")
tag("/assets/forest/wind.mp3", "steady","focus","pink-noise")
# ocean
tag("/assets/ocean/wave.mp3", "steady","focus","pink-noise")
tag("/assets/ocean/wind.mp3", "steady","focus")
tag("/assets/ocean/seagull.mp3", "random","distracting")
tag("/assets/ocean/hum.mp3", "steady","dark","deep-focus")
tag("/assets/ocean/engine.mp3", "steady","masking")
tag("/assets/ocean/sail.mp3", "light","random")
# cafe
tag("/assets/cafe/Chatter.mp3", "random","distracting","cafe")
tag("/assets/cafe/Music.mp3", "random","melodic")
tag("/assets/cafe/Rain.mp3", "steady","relax","focus")
tag("/assets/cafe/Espresso machine.mp3", "random")
tag("/assets/cafe/Kitchen.mp3", "random")
tag("/assets/cafe/Cash register.mp3", "random")
# space
tag("/assets/space/drone.mp3", "steady","deep-focus")
tag("/assets/space/bip.mp3", "random")
tag("/assets/space/breath.mp3", "steady")
tag("/assets/space/fan.mp3", "steady","masking")
tag("/assets/space/type.mp3", "random")
tag("/assets/space/space-sound.mp3", "steady","dark")
# mountain
tag("/assets/mountain/howling-wind.mp3", "steady","focus")
tag("/assets/mountain/chimes.mp3", "random","pleasant")
tag("/assets/mountain/crunching-snow.mp3", "random")
tag("/assets/mountain/ice-cracking.mp3", "random")
tag("/assets/mountain/silence.mp3", "silent")
tag("/assets/mountain/avalanche.mp3", "random","distracting")
# desert
tag("/assets/desert/bazaar.mp3", "random","cafe-like")
tag("/assets/desert/cricket.mp3", "random")
tag("/assets/desert/dark-background.mp3", "steady","masking")
tag("/assets/desert/foot-steps.mp3", "random")
tag("/assets/desert/lizard-eating.mp3", "random")
tag("/assets/desert/sand-storm.mp3", "steady","masking")

GOAL_TO_ROOM = {
    "focus": "forest",
    "deep work": "space",
    "reading": "cafe",
    "sleep": "ocean",
    "relax": "ocean",
    "study": "forest",
}

FOCUS_TAGS = {"steady","focus","pink-noise","masking","deep-focus"}
DISTRACTING_TAGS = {"random","distracting","melodic"}

def choose_room(goal: str) -> str:
    low = (goal or "").lower()
    for k, r in GOAL_TO_ROOM.items():
        if k in low:
            return r
    return "forest"

def score_file(filename: str, goal: str) -> float:
    tags = FILE_TAGS.get(filename, set())
    s = 0.0
    if any(t in tags for t in FOCUS_TAGS):
        s += 1.0
    if any(t in tags for t in DISTRACTING_TAGS):
        s -= 0.6
    return s

def pick_layers_for_goal(room: str, goal: str, n=4) -> List[Dict[str, Any]]:
    candidates = [it for it in PALETTE[room]]
    ranked = sorted(
        candidates,
        key=lambda it: score_file(it["url"].split("/")[-1], goal),
        reverse=True,
    )
    chosen = ranked[:n]
    return [{"url": it["url"], "volume": DEFAULT_VOLS[i]} for i, it in enumerate(chosen)]

def build_timeline(duration_min: int, room: str, base_layers: List[Dict[str,Any]]) -> List[Dict[str,Any]]:
    total_sec = max(5, duration_min) * 60
    timeline: List[Dict[str, Any]] = []
    # minute 0: fade first layer up
    timeline.append({
        "t": 0,
        "op": "fade",
        "target": base_layers[0]["url"].split("/")[-1],
        "to": max(0.28, base_layers[0]["volume"]),
        "sec": 60
    })
    # minute 5: add another steady layer if present
    steady = next((l for l in base_layers[1:] if "steady" in FILE_TAGS.get(l["url"].split("/")[-1], set())), None)
    if steady:
        timeline.append({"t": 5*60, "op": "add", "url": steady["url"], "volume": min(0.26, steady["volume"])})
    # finish: gentle fade and stop
    timeline.append({"t": max(0, total_sec-45), "op": "fade_all", "to": 0.12, "sec": 40})
    timeline.append({"t": total_sec, "op": "stop"})
    return timeline

# --------------------------------------------------------------------

app = FastAPI(title="Vibe Rooms API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class VibeIn(BaseModel):
    text: str

class CommandIn(BaseModel):
    text: str
    layers: List[Dict[str,Any]]

@app.get("/palette")
def palette():
    return PALETTE

@app.post("/vibe")
def vibe(inp: VibeIn):
    q = (inp.text or "").strip()
    room = detect_room_from_text(q)
    if room and room in PALETTE:
        picks = PALETTE[room][:MAX_LAYERS]
        layers = [{"url": it["url"], "volume": DEFAULT_VOLS[i]} for i, it in enumerate(picks)]
        return {
            "label": f"{room.title()} Retreat",
            "description": f"A curated mix from the {room}.",
            "background_url": BACKGROUNDS[room],
            "layers": layers
        }

    try:
        sys = ("Curate an ambient room. Return JSON: "
               "{\"label\":\"...\",\"description\":\"...\",\"background_room\":\"forest|ocean|cafe|space|mountain|desert\","
               "\"layers\":[{\"url\":\"/assets/...mp3\",\"volume\":0.3}, ...]}")
        usr = {"request": q, "candidates": CANDIDATE_LIST, "rooms": ROOMS}
        r = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role":"system","content":sys},{"role":"user","content":json.dumps(usr)}],
            response_format={"type":"json_object"},
            temperature=0.6
        )
        out = json.loads(r.choices[0].message.content or "{}")
        room = out.get("background_room") or "forest"
        layers = force_layers(out.get("layers", []))
        return {
            "label": out.get("label") or q.title() or "Scene",
            "description": out.get("description") or "",
            "background_url": BACKGROUNDS.get(room, BACKGROUNDS["forest"]),
            "layers": layers
        }
    except Exception:
        layers = force_layers([])
        return {
            "label":"Random Scene",
            "description":"Fallback random mix",
            "background_url": random.choice(list(BACKGROUNDS.values())),
            "layers": layers
        }

SWITCH_TRIGGERS = [
    r"\bi want to be\b", r"\bi want\b", r"\bgo to\b", r"\btake me\b",
    r"\bbring me\b", r"\bsend me\b", r"\bput me\b", r"\bin the\b", r"\bin a\b", r"\bto the\b"
]

@app.post("/command")
def command(inp: CommandIn):
    text = (inp.text or "").strip()
    available = [l["url"].split("/")[-1] for l in (inp.layers or [])]
    low = text.lower()

    room = detect_room_from_text(low)
    if room and any(re.search(p, low) for p in SWITCH_TRIGGERS):
        return {"switch_room": room}

    rule = parse_rules(text, available)
    if any(rule.get(k) for k in ("volume_updates","toggle","remove","add")):
        return rule
    if rule == {}:
        return {}  # explicit no-op if verb without confident target

    sys = (
        "Translate natural-language audio commands into JSON actions. "
        "Targets must be from 'available'. You MAY add by URLs from CANDIDATES. "
        "Output STRICT JSON with optional keys only: "
        "{\"volume_updates\":[{\"target\":\"birds.mp3\",\"volume\":0.15}],"
        "\"toggle\":[{\"target\":\"wind.mp3\",\"state\":\"off|on\"}],"
        "\"remove\":[{\"target\":\"foot-steps.mp3\"}],"
        "\"add\":[{\"url\":\"/assets/forest/campfire.mp3\",\"volume\":0.30}]}"
    )
    usr = json.dumps({"text":text, "available":available, "CANDIDATES":CANDIDATE_LIST}, ensure_ascii=False)
    try:
        r = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role":"system","content":sys},{"role":"user","content":usr}],
            response_format={"type":"json_object"},
            temperature=0
        )
        out = json.loads(r.choices[0].message.content or "{}")
        out["volume_updates"] = [
            {"target":u.get("target",""), "volume": max(0.0, min(1.0, float(u.get("volume",0))))}
            for u in (out.get("volume_updates") or []) if u.get("target","") in available
        ]
        out["toggle"] = [
            {"target":t.get("target",""), "state": "off" if t.get("state")=="off" else "on"}
            for t in (out.get("toggle") or []) if t.get("target","") in available
        ]
        out["remove"] = [
            {"target":t.get("target","")} for t in (out.get("remove") or []) if t.get("target","") in available
        ]
        out["add"] = [
            {"url":a.get("url",""), "volume": max(0.1, min(1.0, float(a.get("volume",0.3))))}
            for a in (out.get("add") or []) if a.get("url","") in ALLOWED_URLS
        ]
        return out
    except Exception:
        return {}

# ---------- Adaptive Composer endpoints (no feedback) ----------

class ComposeIn(BaseModel):
    goal: str
    duration_min: int = 25
    user_id: Optional[str] = None

@app.post("/compose")
def compose(inp: ComposeIn):
    room = choose_room(inp.goal)
    layers = pick_layers_for_goal(room, inp.goal, n=min(4, MAX_LAYERS))
    plan = {
        "label": f"{room.title()} – {inp.goal.strip().title() if inp.goal else 'Session'}",
        "description": f"Adaptive plan for {inp.goal or 'focus'} ({inp.duration_min} min).",
        "background_url": BACKGROUNDS[room],
        "room": room,
        "layers": layers,
        "timeline": build_timeline(inp.duration_min, room, layers),
        "context": {"goal": inp.goal, "duration_min": inp.duration_min}
    }
    return plan
