import os
import re
import uuid
import random
import time
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

import requests
from flask import Flask, jsonify, request, Response, stream_with_context
from flask_cors import CORS

# Optional: Google Generative AI (Gemini)
try:
    import google.generativeai as genai
    GEMINI_IMPORTED = True
except Exception:
    GEMINI_IMPORTED = False

app = Flask(__name__)
CORS(app)

# -----------------------------
# Config
# -----------------------------
PORT = int(os.getenv("PORT", 5000))
HOST = os.getenv("HOST", "0.0.0.0")

# Google Generative AI (Gemini)
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "").strip()
GOOGLE_MODEL = os.getenv("GOOGLE_MODEL", "gemini-1.5-flash").strip()
USE_GEMINI_ENV = os.getenv("USE_GEMINI", "auto").lower()  # true | false | auto

# Ollama
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://127.0.0.1:11434").strip()
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2:1b").strip()
USE_OLLAMA_ENV = os.getenv("USE_OLLAMA", "auto").lower()  # true | false | auto

DEFAULT_TUTOR_SYSTEM = "You are a patient, step-by-step AI tutor. Use Socratic questioning and concise explanations."

# Practice generation limits
MAX_QUESTIONS = 50
GEMINI_BATCH = 8
OLLAMA_BATCH = 8

# -----------------------------
# Utils
# -----------------------------
def now_iso() -> str:
    return datetime.utcnow().isoformat() + "Z"

def clamp(v: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, v))

def safe_int(val, default=0) -> int:
    try:
        return int(val)
    except Exception:
        return default

def normalize_whitespace(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()

def extract_json(text: str):
    """Extract a JSON object or array from an LLM response (tolerant to code fences)."""
    if not text:
        return None
    t = text.strip()

    # Strip code fences
    if t.startswith("```"):
        t = re.sub(r"^```(?:json)?\s*", "", t, flags=re.IGNORECASE).strip()
        t = re.sub(r"\s*```$", "", t).strip()

    # Direct parse
    try:
        return json.loads(t)
    except Exception:
        pass

    # Try array
    try:
        start = t.find("[")
        end = t.rfind("]")
        if start != -1 and end != -1 and end > start:
            return json.loads(t[start:end + 1])
    except Exception:
        pass

    # Try object
    try:
        start = t.find("{")
        end = t.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(t[start:end + 1])
    except Exception:
        pass

    return None

def sanitize_questions(items, subject: str, difficulty: int, seen_ids: Optional[set] = None):
    """Normalize questions list and enforce unique IDs."""
    if seen_ids is None:
        seen_ids = set()
    out = []
    if not isinstance(items, list):
        return out
    for q in items:
        t = "multiple_choice" if (q.get("type") == "multiple_choice") else "short_answer"
        raw_id = str(q.get("id") or f"{subject}-{uuid.uuid4().hex[:8]}")
        qid = re.sub(r"\s+", "-", raw_id)
        while qid in seen_ids:
            qid = f"{qid}-{uuid.uuid4().hex[:4]}"
        seen_ids.add(qid)

        qq = {
            "id": qid,
            "question": (q.get("question") or "Untitled").strip(),
            "type": t,
            "correct_answer": str(q.get("correct_answer", "")).strip(),
            "explanation": (q.get("explanation") or "").strip(),
            "difficulty": safe_int(q.get("difficulty", difficulty)) or difficulty,
        }
        if t == "multiple_choice":
            opts = q.get("options", []) or []
            if isinstance(opts, list):
                random.shuffle(opts)
                qq["options"] = opts
        out.append(qq)
    return out

# -----------------------------
# Provider detection
# -----------------------------
def init_gemini() -> bool:
    if not GEMINI_IMPORTED or not GOOGLE_API_KEY:
        return False
    try:
        genai.configure(api_key=GOOGLE_API_KEY)
        return True
    except Exception as e:
        app.logger.warning(f"Gemini init failed: {e}")
        return False

def ollama_available() -> bool:
    try:
        r = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=2.5)
        return r.ok
    except Exception as e:
        app.logger.warning(f"Ollama availability check failed: {e}")
        return False

GEMINI_READY = init_gemini()
USE_GEMINI = (USE_GEMINI_ENV == "true") or (USE_GEMINI_ENV == "auto" and GEMINI_READY)

USE_OLLAMA = (USE_OLLAMA_ENV == "true") or (USE_OLLAMA_ENV == "auto" and ollama_available())

PROVIDER = "gemini" if USE_GEMINI else ("ollama" if USE_OLLAMA else "local")

# -----------------------------
# Gemini helpers
# -----------------------------
def get_gemini_model(system_prompt: Optional[str] = None):
    if not USE_GEMINI:
        return None
    try:
        return genai.GenerativeModel(
            model_name=GOOGLE_MODEL,
            system_instruction=system_prompt or DEFAULT_TUTOR_SYSTEM,
        )
    except Exception as e:
        app.logger.error(f"Gemini model init error: {e}")
        return None

def gemini_generate(prompt: str, system: Optional[str] = None, json_output: bool = False) -> str:
    """Single-turn generation."""
    if not USE_GEMINI:
        return ""
    model = get_gemini_model(system)
    if model is None:
        return "Gemini error: model init failed"
    gen_cfg = {"temperature": 0.6}
    if json_output:
        gen_cfg["response_mime_type"] = "application/json"
    try:
        resp = model.generate_content(prompt, generation_config=gen_cfg)
        text = getattr(resp, "text", "") or ""
        return text.strip()
    except Exception as e:
        app.logger.error(f"Gemini generate exception: {e}")
        return f"Gemini error: {e}"

def to_gemini_history(messages: List[Dict[str, str]]) -> List[Dict[str, Any]]:
    history = []
    for m in messages:
        role = m.get("role", "user")
        content = m.get("content", "")
        if not content:
            continue
        if role == "assistant":
            role = "model"
        elif role == "system":
            continue
        elif role != "user":
            role = "user"
        history.append({"role": role, "parts": [content]})
    return history

def gemini_chat(messages: List[Dict[str, str]], stream: bool = False, system: Optional[str] = None):
    if not USE_GEMINI:
        return "Gemini is not enabled."
    model = get_gemini_model(system)
    if model is None:
        return "Gemini error: model init failed"
    last_user = ""
    for m in reversed(messages):
        if m.get("role") == "user":
            last_user = m.get("content", "")
            break
    history = to_gemini_history(messages[:-1])
    try:
        chat = model.start_chat(history=history)
        if stream:
            def gen():
                try:
                    resp = chat.send_message(last_user, stream=True)
                    had = False
                    for chunk in resp:
                        txt = getattr(chunk, "text", "") or ""
                        if txt:
                            had = True
                            yield txt
                    if not had:
                        yield "I couldn't get a response from the model. Please try again."
                except Exception as e:
                    yield f"Gemini error: {e}"
            return gen()
        else:
            resp = chat.send_message(last_user)
            txt = getattr(resp, "text", "") or ""
            return txt.strip() or "I couldn't get a response from the model. Please try again."
    except Exception as e:
        app.logger.error(f"Gemini chat exception: {e}")
        return f"Gemini error: {e}"

# -----------------------------
# Ollama helpers
# -----------------------------
def ollama_generate(prompt: str, system: str = None, stream: bool = False) -> str:
    if not USE_OLLAMA:
        return ""
    payload = {"model": OLLAMA_MODEL, "prompt": prompt, "stream": stream}
    if system:
        payload["system"] = system
    try:
        resp = requests.post(f"{OLLAMA_HOST}/api/generate", json=payload, stream=stream, timeout=180)
        if not resp.ok:
            try:
                err = resp.json().get("error", resp.text)
            except Exception:
                err = resp.text
            app.logger.error(f"Ollama generate error: {resp.status_code} {err}")
            return f"Ollama error: {err}"
        if not stream:
            data = resp.json()
            return (data.get("response") or "").strip()
        else:
            chunks = []
            for line in resp.iter_lines():
                if not line:
                    continue
                try:
                    data = json.loads(line.decode("utf-8"))
                    if "response" in data:
                        chunks.append(data["response"])
                except Exception:
                    continue
            return "".join(chunks).strip()
    except Exception as e:
        app.logger.error(f"Ollama generate exception: {e}")
        return f"Ollama error: {e}"

def ollama_chat(messages: List[Dict[str, str]], stream: bool = False):
    if not USE_OLLAMA:
        return "Ollama is not enabled."
    payload = {"model": OLLAMA_MODEL, "messages": messages, "stream": stream}
    try:
        if not stream:
            r = requests.post(f"{OLLAMA_HOST}/api/chat", json=payload, timeout=180)
            if not r.ok:
                try:
                    err = r.json().get("error", r.text)
                except Exception:
                    err = r.text
                app.logger.error(f"Ollama chat error: {r.status_code} {err}")
                return f"Ollama error: {err}"
            data = r.json()
            content = (data.get("message", {}) or {}).get("content", "")
            return content.strip()
        else:
            def gen():
                with requests.post(f"{OLLAMA_HOST}/api/chat", json=payload, stream=True, timeout=180) as r:
                    if not r.ok:
                        try:
                            err = r.json().get("error", r.text)
                        except Exception:
                            err = r.text
                        yield f"Ollama error: {err}"
                        return
                    for line in r.iter_lines():
                        if not line:
                            continue
                        try:
                            data = json.loads(line.decode("utf-8"))
                            content = data.get("message", {}).get("content", "")
                            if content:
                                yield content
                        except Exception:
                            continue
            return gen()
    except Exception as e:
        app.logger.error(f"Ollama chat exception: {e}")
        if stream:
            def fallback():
                yield f"Ollama error: {e}"
            return fallback()
        return f"Ollama error: {e}"

# -----------------------------
# Demo data
# -----------------------------
DASHBOARD = {
    "stats": [
        {"title": "Total Study Sessions", "value": "24", "change": "+12%"},
        {"title": "Practice Questions", "value": "156", "change": "+23%"},
        {"title": "Average Score", "value": "87%", "change": "+5%"},
        {"title": "Chat Messages", "value": "89", "change": "+18%"},
    ],
    "subjects": [
        {"name": "Mathematics", "level": 85, "sessions": 8, "lastActivity": "2 hours ago"},
        {"name": "Science", "level": 72, "sessions": 6, "lastActivity": "1 day ago"},
        {"name": "History", "level": 91, "sessions": 5, "lastActivity": "3 days ago"},
        {"name": "English", "level": 78, "sessions": 5, "lastActivity": "2 days ago"},
    ],
    "recent_activity": [
        {"type": "practice", "subject": "Mathematics", "description": "Completed algebra practice session", "score": 92, "time": "2 hours ago"},
        {"type": "chat", "subject": "Science", "description": "Asked about photosynthesis", "time": "5 hours ago"},
        {"type": "grading", "subject": "English", "description": "Essay on climate change", "score": 85, "time": "1 day ago"},
        {"type": "practice", "subject": "History", "description": "World War II quiz", "score": 88, "time": "2 days ago"},
    ],
    "achievements": [
        {"title": "Math Streak", "subtitle": "5 days in a row"},
        {"title": "High Scorer", "subtitle": "90%+ on last 3 tests"},
        {"title": "Study Buddy", "subtitle": "100+ chat messages"},
    ],
}

QUESTION_BANK = {
    "math": [
        {"question": "Solve for x: 2x + 5 = 15", "type": "short_answer", "correct_answer": "5", "explanation": "Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5"},
        {"question": "What is the area of a circle with radius 3?", "type": "multiple_choice", "options": ["9π", "6π", "3π", "12π"], "correct_answer": "9π", "explanation": "Area = πr², so π × 3² = 9π"},
        {"question": "If f(x)=3x-2, what is f(4)?", "type": "short_answer", "correct_answer": "10", "explanation": "f(4)=3*4-2=12-2=10"},
    ],
    "science": [
        {"question": "What is the chemical symbol for gold?", "type": "multiple_choice", "options": ["Go", "Gd", "Au", "Ag"], "correct_answer": "Au", "explanation": 'Au comes from the Latin "aurum".'},
        {"question": "Plants convert sunlight to energy in what process?", "type": "multiple_choice", "options": ["Respiration", "Osmosis", "Photosynthesis", "Fermentation"], "correct_answer": "Photosynthesis", "explanation": "Converts light to glucose."},
    ],
    "history": [
        {"question": "In what year did World War II end?", "type": "multiple_choice", "options": ["1944", "1945", "1946", "1943"], "correct_answer": "1945", "explanation": "Japan's surrender in 1945."},
        {"question": "Who was the first President of the United States?", "type": "multiple_choice", "options": ["Abraham Lincoln", "Thomas Jefferson", "George Washington", "John Adams"], "correct_answer": "George Washington", "explanation": "Served 1789–1797."},
    ],
    "english": [
        {"question": 'What is the plural of "child"?', "type": "multiple_choice", "options": ["childs", "children", "childes", "child"], "correct_answer": "children", "explanation": "Irregular plural."},
        {"question": "Identify the verb: She quickly wrote the letter.", "type": "multiple_choice", "options": ["She", "quickly", "wrote", "letter"], "correct_answer": "wrote", "explanation": '"Wrote" is the action.'},
    ],
}

# -----------------------------
# Health / Root
# -----------------------------
@app.get("/health")
def health():
    return jsonify({
        "ok": True,
        "timestamp": now_iso(),
        "provider": PROVIDER,
        "use_gemini": USE_GEMINI,
        "gemini_model": GOOGLE_MODEL if USE_GEMINI else None,
        "use_ollama": USE_OLLAMA,
        "ollama_model": OLLAMA_MODEL if USE_OLLAMA else None,
    })

@app.get("/")
def root():
    return jsonify({"service": "LearnAI backend", "ok": True, "docs": "/health"})

# -----------------------------
# Dashboard (Progress)
# -----------------------------
@app.get("/dashboard")
def get_dashboard():
    return jsonify(DASHBOARD)

# -----------------------------
# Practice
# -----------------------------
@app.get("/practice/subjects")
def get_practice_subjects():
    return jsonify({"subjects": list(QUESTION_BANK.keys())})

def make_math_variant(difficulty: int):
    # Simple linear equation ax + b = c
    a = random.randint(1, 12)
    x = random.randint(1, 20)
    b = random.randint(-10, 10)
    c = a * x + b
    sign = '+' if b >= 0 else '-'
    q = f"Solve for x: {a}x {sign} {abs(b)} = {c}"
    expl = f"Move the constant: {a}x = {c} {('-' if b >= 0 else '+')} {abs(b)} = {c - b}. Then x = {(c - b)}/{a} = {x}"
    return {
        "id": f"math-{uuid.uuid4().hex[:8]}",
        "question": q,
        "type": "short_answer",
        "correct_answer": str(x),
        "explanation": expl,
        "difficulty": difficulty,
    }

def fill_from_bank(subject: str, count: int, difficulty: int):
    bank = QUESTION_BANK.get(subject, QUESTION_BANK["math"])
    out = []
    for _ in range(count):
        base = random.choice(bank)
        item = {
            "id": f"{subject}-{uuid.uuid4().hex[:8]}",
            "question": base["question"],
            "type": base["type"],
            "correct_answer": base["correct_answer"],
            "explanation": base["explanation"],
            "difficulty": difficulty,
        }
        if base["type"] == "multiple_choice":
            opts = list(base.get("options", []))
            random.shuffle(opts)
            item["options"] = opts
        out.append(item)
    return out

@app.post("/practice/generate")
def generate_practice():
    try:
        data = request.get_json(silent=True) or {}
        subject = (data.get("subject") or "math").lower().strip()
        difficulty = safe_int(data.get("difficulty", 3))
        difficulty = int(clamp(difficulty, 1, 5))
        requested = safe_int(data.get("num_questions", 2))
        requested = int(clamp(requested, 1, MAX_QUESTIONS))

        seen_ids = set()
        questions: List[Dict[str, Any]] = []

        # Prefer Gemini in batches
        if USE_GEMINI:
            remaining = requested
            while remaining > 0:
                batch = min(GEMINI_BATCH, remaining)
                prompt = f"""
You are a test item writer. Write {batch} short, self-contained questions for the subject "{subject}".
Return STRICT JSON ONLY: an array of objects with keys:
id (string), question (string), type ("multiple_choice" or "short_answer"),
options (array of strings, only when type is "multiple_choice"),
correct_answer (string), explanation (string), difficulty (integer 1-5).
No markdown, no prose, JSON only. Difficulty ≈ {difficulty}.
"""
                raw = gemini_generate(prompt.strip(), json_output=True)
                if raw and not raw.lower().startswith("gemini error:"):
                    parsed = extract_json(raw)
                    if isinstance(parsed, dict) and "questions" in parsed:
                        parsed = parsed["questions"]
                    qs = sanitize_questions(parsed or [], subject, difficulty, seen_ids)
                    questions.extend(qs)
                    remaining = requested - len(questions)
                else:
                    break  # fall back
            if len(questions) >= requested:
                return jsonify({"questions": questions[:requested], "source": "gemini"})

        # Fallback: Ollama in batches
        if USE_OLLAMA:
            remaining = requested - len(questions)
            while remaining > 0:
                batch = min(OLLAMA_BATCH, remaining)
                prompt = f"""
You are a test item writer. Write {batch} short, self-contained questions for the subject "{subject}".
Output strict JSON array of objects with keys:
id, question, type ("multiple_choice" or "short_answer"), options (array if MCQ), correct_answer, explanation, difficulty (1-5).
Return JSON only.
"""
                raw = ollama_generate(prompt.strip(), stream=False)
                if raw and not raw.lower().startswith("ollama error:"):
                    parsed = extract_json(raw)
                    if isinstance(parsed, dict) and "questions" in parsed:
                        parsed = parsed["questions"]
                    qs = sanitize_questions(parsed or [], subject, difficulty, seen_ids)
                    questions.extend(qs)
                    remaining = requested - len(questions)
                else:
                    break
            if len(questions) >= requested:
                return jsonify({"questions": questions[:requested], "source": "ollama"})

        # Final fallback: local generation
        remaining = requested - len(questions)
        if subject == "math":
            for _ in range(remaining):
                questions.append(make_math_variant(difficulty))
        else:
            questions.extend(fill_from_bank(subject, remaining, difficulty))

        return jsonify({"questions": questions[:requested], "source": "bank"})
    except Exception as e:
        app.logger.exception("generate_practice crashed")
        # Return safe fallback
        fallback = fill_from_bank("math", 2, 3)
        return jsonify({"questions": fallback, "source": "bank", "warning": f"fallback due to error: {e}"}), 200

# -----------------------------
# Grading
# -----------------------------
def heuristic_grade(submission: str, rubric_text: str = "") -> Dict[str, Any]:
    text = normalize_whitespace(submission)
    words = re.findall(r"\b[\w'-]+\b", text)
    word_count = len(words)
    sentences = [s.strip() for s in re.split(r"[.!?]+", text) if s.strip()]
    sent_count = len(sentences) or 1
    paragraphs = [p.strip() for p in re.split(r"\n{2,}", submission) if p.strip()]
    para_count = len(paragraphs) if paragraphs else (1 if text else 0)
    long_words = [w for w in words if len(w) >= 6]
    long_ratio = (len(long_words) / word_count) if word_count else 0.0
    connectors = ["because","therefore","however","moreover","in addition","for example","consequently","thus","nevertheless","furthermore","on the other hand"]
    connector_hits = sum(1 for c in connectors if c in text.lower())
    has_conclusion = any(k in text.lower() for k in ["in conclusion","to conclude","overall"])
    has_intro = any(k in text.lower() for k in ["in this essay","this paper","firstly"])
    avg_sentence_len = word_count / sent_count if sent_count else word_count
    punctuation_density = len(re.findall(r"[,:;()-]", text)) / max(word_count, 1)

    def sc(v: float, max_score: int = 25) -> int:
        return int(round(clamp(v, 0, max_score)))

    content_score = 10 + (min(word_count, 600) / 600) * 10 + min(long_ratio * 10, 5)
    analysis_score = 8 + min(connector_hits * 2.8, 12) + (3 if 10 < avg_sentence_len < 28 else 0)
    organization_score = 8 + min(para_count * 3, 9) + (4 if has_intro else 0) + (4 if has_conclusion else 0)
    writing_score = 10 + (5 if 12 <= avg_sentence_len <= 24 else 0) + (5 if 0.01 <= punctuation_density <= 0.06 else 0)

    breakdown = [
        {"category": "Content Knowledge", "score": sc(content_score), "max_score": 25, "feedback": "Solid understanding; add more specific evidence."},
        {"category": "Analysis & Reasoning", "score": sc(analysis_score), "max_score": 25, "feedback": "Good reasoning; add clearer transitions and consider counterpoints."},
        {"category": "Organization & Structure", "score": sc(organization_score), "max_score": 25, "feedback": "Clear structure; add a concise intro and stronger conclusion."},
        {"category": "Writing Quality", "score": sc(writing_score), "max_score": 25, "feedback": "Readable; vary sentence structure and review punctuation."},
    ]
    overall = sum(item["score"] for item in breakdown)
    overall = int(clamp(overall, 0, 100))
    overall_feedback = "Well-structured response with solid understanding. Improve by adding specific evidence, clearer transitions, and a concise conclusion."
    return {"score": overall, "feedback": overall_feedback, "rubric_breakdown": breakdown}

@app.post("/grading/grade")
def grade():
    data = request.get_json(silent=True) or {}
    submission = (data.get("submission") or "").strip()
    rubric = (data.get("rubric") or "").strip()

    if not submission:
        return jsonify({"error": "Submission text is required."}), 400

    # Prefer Gemini
    if USE_GEMINI:
        prompt = f"""
You are an expert grader. Grade the student's submission on a 0-100 scale using these categories:
- Content Knowledge (25)
- Analysis & Reasoning (25)
- Organization & Structure (25)
- Writing Quality (25)

Submission:
\"\"\"{submission}\"\"\"

Rubric (optional):
\"\"\"{rubric}\"\"\"

Respond with STRICT JSON ONLY in this schema:
{{
  "score": <int 0-100>,
  "feedback": "<concise holistic feedback>",
  "rubric_breakdown": [
    {{"category":"Content Knowledge","score":<0-25>,"max_score":25,"feedback":"..."}},
    {{"category":"Analysis & Reasoning","score":<0-25>,"max_score":25,"feedback":"..."}},
    {{"category":"Organization & Structure","score":<0-25>,"max_score":25,"feedback":"..."}},
    {{"category":"Writing Quality","score":<0-25>,"max_score":25,"feedback":"..."}}
  ]
}}
No prose, no markdown, JSON only.
"""
        raw = gemini_generate(prompt.strip(), json_output=True)
        if raw and not raw.lower().startswith("gemini error:"):
            parsed = extract_json(raw)
            if isinstance(parsed, dict):
                try:
                    parsed["score"] = safe_int(parsed.get("score", 0))
                    if "rubric_breakdown" in parsed and isinstance(parsed["rubric_breakdown"], list):
                        for item in parsed["rubric_breakdown"]:
                            item["score"] = safe_int(item.get("score", 0))
                            item["max_score"] = safe_int(item.get("max_score", 25)) or 25
                    return jsonify(parsed)
                except Exception as e:
                    app.logger.warning(f"Gemini grading normalize failed: {e}")

    # Fallback: Ollama
    if USE_OLLAMA:
        prompt = f"""
You are an expert grader. Grade the student's submission on a 0-100 scale with categories (25 points each):
Content Knowledge, Analysis & Reasoning, Organization & Structure, Writing Quality.

Submission:
\"\"\"{submission}\"\"\"

Rubric (optional):
\"\"\"{rubric}\"\"\"

Return STRICT JSON only in schema:
{{"score":0-100,"feedback":"...","rubric_breakdown":[{{"category":"Content Knowledge","score":0-25,"max_score":25,"feedback":"..."}},{{"category":"Analysis & Reasoning","score":0-25,"max_score":25,"feedback":"..."}},{{"category":"Organization & Structure","score":0-25,"max_score":25,"feedback":"..."}},{{"category":"Writing Quality","score":0-25,"max_score":25,"feedback":"..."}}]]}}
"""
        raw = ollama_generate(prompt.strip(), stream=False)
        if raw and not raw.lower().startswith("ollama error:"):
            parsed = extract_json(raw)
            if isinstance(parsed, dict):
                try:
                    parsed["score"] = safe_int(parsed.get("score", 0))
                    if "rubric_breakdown" in parsed and isinstance(parsed["rubric_breakdown"], list):
                        for item in parsed["rubric_breakdown"]:
                            item["score"] = safe_int(item.get("score", 0))
                            item["max_score"] = safe_int(item.get("max_score", 25)) or 25
                    return jsonify(parsed)
                except Exception as e:
                    app.logger.warning(f"Ollama grading normalize failed: {e}")

    # Final fallback: heuristic (always 200)
    result = heuristic_grade(submission, rubric)
    return jsonify(result)

# -----------------------------
# Tutor Chat
# -----------------------------
@app.post("/tutor/chat")
def tutor_chat():
    data = request.get_json(silent=True) or {}
    message = (data.get("message") or "").strip()
    history = data.get("history") or []  # list of {role, content}
    stream = bool(data.get("stream", False))
    system_prompt = data.get("system") or DEFAULT_TUTOR_SYSTEM

    if not message:
        return jsonify({"error": "message is required"}), 400

    # Build generic msgs
    msgs = [{"role": "system", "content": system_prompt}]
    for m in history:
        role = m.get("role", "user")
        content = m.get("content", "")
        if not content:
            continue
        if role not in ("user", "assistant", "system"):
            role = "user"
        msgs.append({"role": role, "content": content})
    msgs.append({"role": "user", "content": message})

    # Prefer Gemini
    if USE_GEMINI:
        if stream:
            gen = gemini_chat(msgs, stream=True, system=system_prompt)

            @stream_with_context
            def generate():
                if isinstance(gen, str):
                    out = (gen or "").strip()
                    yield out or "I couldn't get a response from the model. Check your Google API key and model."
                    return
                had = False
                for chunk in gen:
                    had = True
                    yield chunk
                if not had:
                    yield "I couldn't get a response from the model. Check your Google API key and model."
            return Response(generate(), mimetype="text/plain")
        else:
            content = gemini_chat(msgs, stream=False, system=system_prompt)
            if not content or not str(content).strip():
                content = "I couldn't get a response from the model. Check your Google API key and model."
            return jsonify({
                "id": str(uuid.uuid4()),
                "reply": content.strip(),
                "suggestions": [
                    "Can you show me a similar example?",
                    "Walk me through this step by step.",
                    "What common mistakes should I avoid here?",
                ],
                "timestamp": now_iso(),
            })

    # Fallback: Ollama
    if USE_OLLAMA:
        if stream:
            gen = ollama_chat(msgs, stream=True)

            @stream_with_context
            def generate():
                if isinstance(gen, str):
                    yield gen
                    return
                for chunk in gen:
                    yield chunk
            return Response(generate(), mimetype="text/plain")
        else:
            content = ollama_chat(msgs, stream=False)
            if not content or not str(content).strip():
                content = "I couldn't get a response from the model. Verify Ollama is running and the model tag is correct."
            return jsonify({
                "id": str(uuid.uuid4()),
                "reply": content.strip(),
                "suggestions": [
                    "Can you show me a similar example?",
                    "Walk me through this step by step.",
                    "What common mistakes should I avoid here?",
                ],
                "timestamp": now_iso(),
            })

    # Final fallback
    generic = "Let's break it down: what is known, what is asked, and what steps connect them?"
    return jsonify({
        "id": str(uuid.uuid4()),
        "reply": generic,
        "suggestions": [
            "Can you show me a similar example?",
            "Walk me through this step by step.",
            "What common mistakes should I avoid here?",
        ],
        "timestamp": now_iso(),
    })

# -----------------------------
# Run
# -----------------------------
if __name__ == "__main__":
    print(f"Starting LearnAI backend on http://{HOST}:{PORT}")
    print(f"Provider: {PROVIDER} | Gemini: {USE_GEMINI} ({GOOGLE_MODEL if USE_GEMINI else '-'}) | Ollama: {USE_OLLAMA} ({OLLAMA_MODEL if USE_OLLAMA else '-'})")
    app.run(host=HOST, port=PORT, debug=True)