# Memooroo – LearnAI Track Submission

**OpenxAI Global Accelerator 2025 University Hackathon**  
**Track**: LearnAI - AI-powered educational tools  
**Project Folder**: `00_HACKATHON-SUBMISSIONS/0002_memooroo/`  
**Team Signup**: https://accelerator.openxai.org/

*(Share this doc with the whole squad so everyone is rowing in the same direction.)*

---

## 1 – The 60‑second pitch

> **Memooroo** turns any lecture video or PDF into an *adaptive* flashcard+quiz experience in under a minute.
> Learners paste a link → Memooroo auto‑transcribes, chunks, and generates spaced‑repetition decks **plus** a mastery‑tracking quiz game that can be played solo or live with classmates.
> Teachers get "One‑Click Classroom" rooms and real‑time analytics; students keep hopping back because the roo‑mascot, live leaderboard and AI hints make studying feel like a game.

---

## 2 – Key features (judge‑wow hierarchy)

| Tier                    | Feature                     | What the judge sees in demo                                                | Technical bullet(s)                                                          |
| ----------------------- | --------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| **MVP (Day 1‑5)**       | Paste‑link → deck & quiz    | 45 s progress bar, finished deck appears with mastery ring                 | Whisper (caption fallback) → GPT‑4o (function‑call) → JSON schema validation |
|                         | Interactive quiz cards      | Flip, answer, hint button (little hopping roo)                             | React server components + Tailwind; hint served via secondary GPT function   |
|                         | Mastery ring                | Ring fills per correct answer; resets per session                          | Supabase table `progress` (user, card, score)                                |
| **Polish (Day 6‑12)**   | Multiplayer Room            | Teacher creates 4‑digit code, students race through quiz, live leaderboard | Supabase Realtime on `room_answers`; client sub; optimistic updates          |
|                         | Spaced‑Repetition Scheduler | Daily email "Time to hop back!"                                            | Cron job (Supabase Edge Function) + mastery algorithm                        |
|                         | Roo Mascot Animation        | Confetti hop on 100 % mastery                                              | Lottie JSON animation triggered by state machine                             |
| **Stretch (Day 13‑20)** | LMS / LTI stub              | In slide deck: Canvas imports Memooroo link, demo token auth               | JSON manifest + deep‑link redirect proof                                     |
|                         | Voice Playback Mode         | Chat‑style audio playback of questions/answers                             | ElevenLabs TTS (or Ollama llama3-voice) streamed via Web Audio               |
|                         | Knowledge Score Analytics   | Grafana panel embedded: avg mastery Δ per session                          | Postgres view + Grafana Cloud iframe                                         |

---

## 3 – Tech stack & architecture (hackathon-compliant)

| Layer             | Core Stack (Required)                          | Enhanced Features (LearnAI Track)                                              |
| ----------------- | ---------------------------------------------- | ------------------------------------------------------------------------------- |
| **Frontend**      | ✅ Next.js 15, TypeScript, Tailwind CSS        | + Framer Motion, shadcn/ui for polished educational UX                        |
| **AI Integration** | ✅ Ollama (llama3.2:1b fallback)               | + GPT-4o for production-quality quiz generation & hints                       |
| **Backend API**   | ✅ Next.js API routes                           | + tRPC for type-safe educational data handling                                 |
| **AI Worker**     | Enhanced: Python FastAPI + Celery             | Async video processing pipeline for educational content                        |
| **Audio/Video**   | Enhanced: Whisper transcription               | YouTube captions fallback for accessibility                                   |
| **DB / Auth**     | Enhanced: Supabase (ap-southeast-1)           | Real-time multiplayer classrooms + progress tracking                          |
| **DevOps**        | ✅ Docker Compose deployment                    | + GitHub Actions for continuous educational content updates                    |

**Hackathon Compliance Notes:**
- **Base tech stack**: Fully compliant with Next.js 15 + TypeScript + Tailwind + Ollama
- **Enhanced for LearnAI**: Educational-specific features using GPT-4o for quiz quality
- **Fallback strategy**: Ollama llama3.2:1b when GPT-4o unavailable or for cost optimization

---

## 4 – Team roles & deliverables

| Member         | Core role         | Sprint focus                                      | Demo deliverables                   |
| -------------- | ----------------- | ------------------------------------------------- | ----------------------------------- |
| **Reece**      | Lead Backend / AI | Whisper pipeline, GPT prompt design, Celery tasks | Live log tail + JSON quiz           |
| **You**        | API & DevOps      | tRPC endpoints, Docker, CI/CD, Grafana dashboards | One‑click deploy, cost metrics      |
| **Emmanuel**   | Frontend & UX     | Next.js pages, Tailwind polish, mascot animations | Slick UI, mastery ring, mascot hop  |
| **Teammate 4** | Product & QA      | Room flow, test scripts, pitch deck, video        | 2‑min Loom demo, judging slide pack |

---

## 5 – Milestones & timeline (gated for judge rubric)

| Date                    | Deliverable               | "Definition of done"                                 |
| ----------------------- | ------------------------- | ---------------------------------------------------- |
| **Jul 23**              | MVP flow working          | Paste URL → `jobId` → polling returns **hard-coded quiz JSON (3 cards)**, cards render & flip. No real AI yet, but full async pipeline proven |
| **Jul 26**              | Teacher room + Realtime   | Two browser windows racing on same quiz              |
| **Jul 30**              | UX polish pass            | Mascot, Framer Motion, responsive mobile             |
| **Aug 4**               | Metrics + email scheduler | Grafana dashboard + daily reminder email             |
| **Aug 8**               | Stretch features freeze   | Voice playback stub works; LTI slide ready           |
| **Aug 10**              | Demo rehearsal            | 3‑min live run through, under 2 MB GIF for README    |
| **Aug 12 (submission)** | PR + video + README       | All team members listed; video link; deploy URL      |

---

## 6 – Judge scoring alignment

1. **Innovation (30 %)** – Real‑time RooRoom battles & adaptive mastery.
2. **Technical Quality (25 %)** – Schema‑validated quiz JSON, Grafana metrics, Celery queue.
3. **UX (25 %)** – Vibrant mascot animations, zero‑click join flow.
4. **Impact (20 %)** – "1‑minute to usable study deck" + teacher analytics.

---

## 7 – Demo script (2‑min live run)

1. **Intro** – 10 s: "Paste any lecture link."
2. **Paste** link – spinner + roo hop. Talk cost/time.
3. **Quiz appears** – flip 2 cards, show hint.
4. **Open RooRoom** – second tab joins, leaderboard jumps.
5. **Mastery ring hits 100 %** – mascot confetti.
6. **Grafana overlay** – "37 s, \$0.07, 97 % success."
7. **Done** – call to action: "Stop cramming, start hopping."

---

## 8 – Risk & mitigation

| Risk                   | Mitigation                                                        |
| ---------------------- | ----------------------------------------------------------------- |
| Whisper API rate‑limit | Local fallback to YouTube captions; limit video length in demo    |
| GPT schema failures    | JSON schema + Pydantic validation + retry 2×                      |
| Realtime lag           | Pre‑warm Supabase Realtime edge; limit room to 8 students in demo |
| Demo Wi‑Fi dead        | Have a pre‑recorded Loom backup; offline video in slide file      |

---

## 9 – Technical decisions (finalized 22 Jul)

| Question               | Decision                                                                                  |
| ---------------------- | ----------------------------------------------------------------------------------------- |
| **Architecture**       | Monorepo: Next.js holds frontend + tRPC server, separate Python FastAPI worker           |
| **API Pattern**        | Async: `startJob()` → `jobId`, client polls `pollJob()` until status = "done"            |
| **Authentication**     | Supabase email magic-link + guest mode (no OAuth for MVP)                                |
| **Room Management**    | tRPC handles create/join (with auth), frontend subscribes to Supabase Realtime directly  |
| **Redis Scope**        | Celery broker/backend only (no caching/sessions in MVP)                                  |
| **Deployment**         | Single `docker-compose.yml` for dev + prod, GitHub Actions auto-deploy on main pushes   |
| **Whisper Strategy**   | Primary transcription, YouTube captions as fallback for English videos                   |
| **LTI Integration**    | Mock LTI 1.3 endpoints (demo Canvas import potential, not fully certified)              |
| **MVP Scope (Jul 23)** | Hard-coded quiz JSON (3 cards), full async pipeline working, cards flip                 |

## 10 – Hackathon submission requirements

| Requirement           | Status | Details                                                                       |
| --------------------- | ------ | ----------------------------------------------------------------------------- |
| **Official Signup**   | ⏳ TODO | All team members register at https://accelerator.openxai.org/                |
| **Folder Structure**  | ⚠️ FIX  | Rename `0002-autoquizzer` → `0002_memooroo` (underscore format required)     |
| **Branch & PR**       | ⏳ TODO | Create branch `memooroo-learnai`, PR to main (Aug 12th deadline)             |
| **README.md**         | ⏳ TODO | Include team members, YouTube demo video link, installation instructions     |
| **Demo Video**        | ⏳ TODO | 2-3min YouTube video showing app + explaining why it should win               |
| **Code Commits**      | ⏳ TODO | All code committed during hackathon period (Jul 18 - Aug 12)                 |

**Team Members (for README.md):**
- **Ben** (You) - API & DevOps, tRPC endpoints, Docker, CI/CD, Grafana dashboards
- **Reece** - Lead Backend / AI, Whisper pipeline, GPT prompt design, Celery tasks  
- **Emmanuel** - Frontend & UX, Next.js pages, Tailwind polish, mascot animations
- **Teammate 4** - Product & QA, Room flow, test scripts, pitch deck, video

## 11 – Next actions (as of **22 Jul**)

**Immediate (Jul 23):**
1. **Fix folder naming** – Rename to `00_HACKATHON-SUBMISSIONS/0002_memooroo/`
2. **Team signup** – All members register at accelerator.openxai.org
3. **Fresh Supabase project** – Region: `ap-southeast-1`, get URL + keys  
4. **Docker compose setup** – Next.js + Python worker + Redis services
5. **Ollama integration** – Download `ollama pull llama3.2:1b` for compliance

**Sprint (Jul 24-26):**
6. **tRPC async endpoints** – `startJob`, `pollJob` with job status tracking
7. **LinkForm component** – Emmanuel (frontend UI)
8. **Celery worker skeleton** – Reece (Python FastAPI service)
9. **Daily 15‑min stand‑up** – 9 AM Discord, huddle link #standup

---

### 🚀  Remember

* **Speed to first demo.** Wow them early, polish later.
* **Measure everything** (cost, latency, mastery gain).
* **Personality matters** – mascot, colors, micro‑animations.

Let's hop to it! 🦘