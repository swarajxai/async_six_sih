# LIFE-LINK — SIH 2026 Prototype

**LIFE-LINK** — Real-Time Emergency Blood Donor Matching Platform
**Team:** Async Six · **Event:** Smart India Hackathon 2026 · **Theme:** MEDTECH / BIOTECH

This is the **judge-facing clickable prototype**. It is a frontend-only React + TypeScript + Vite + Tailwind app. Every interaction is simulated in-browser. No backend, no API keys, no external services required.

---

## 1. What this prototype demonstrates

LIFE-LINK is **not** another static blood-donor directory. It is an **active real-time emergency coordination engine** that, in a single hospital request:

1. Verifies the hospital-issued request
2. Runs a smart donor match (blood compatibility + distance + eligibility + availability + reliability)
3. Sends **simultaneous** alerts to the top 10 eligible donors
4. **Locks** the first confirmed donor and pauses the rest
5. Checks **partner blood banks in parallel**
6. Tracks live **ETA / en-route / screening**
7. If the primary donor fails screening, **automatically activates the next eligible donor** (no dead end)
8. Closes the loop with a **donor reward + badge** and an **immutable hospital timeline**

---

## 2. Running locally

Requires **Node.js 18+** and npm.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# → open http://localhost:5173

# 3. (Optional) Production build
npm run build
npm run preview   # serves the built bundle at http://localhost:4173

# 4. (Optional) Type-check only
npm run typecheck
```

That's it. No `.env`, no API keys, no external services.

---

## 3. Project structure

```
src/
  components/      Reusable UI (Brand, DonorCard, Timeline, MapPlaceholder, etc.)
  pages/           One file per screen (Login, Dashboard, Request, Matching,
                   Alerting, Coordination, Success)
  data/demoData.ts All mock data — hospital, 10 ranked donors, 2 blood banks,
                   recent requests, metrics. Edit here to tweak the demo.
  context/         DemoContext — full demo state machine + resetDemo()
  types/           TypeScript interfaces
  utils/           Time helpers
  App.tsx          React Router routes
  main.tsx         Entry point
  index.css        Tailwind + small custom animations
```

The mock layer is intentionally isolated so a real backend can replace `src/data/demoData.ts` and the `DemoContext` actions without changing the UI.

---

## 4. Judge demo flow (~3 minutes)

The whole demo uses **one** click per step. Speak between steps, not during.

| # | Screen          | Action                                                  | What to say (≈ 5 s)                                                                                 |
|---|-----------------|---------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| 1 | **Login**       | Click **Login** (already filled)                        | "LIFE-LINK is a real-time emergency coordination engine. Let me show you one emergency end-to-end." |
| 2 | **Dashboard**   | Click **+ Raise Emergency Request**                     | "I'm logged in as VSS Hospital. Patient Aarav Mishra needs O- blood. Critical, 60 minutes."          |
| 3 | **Request**     | Click **Start Emergency Matching**                      | "LIFE-LINK verifies the hospital request and starts ranking donors."                                |
| 4 | **Matching**    | Wait ≈ 3 s for the 5-step checklist, then click **Alert Top 10 Donors Simultaneously** | "Traditional systems call donors one by one. LIFE-LINK alerts all 10 at once."                |
| 5 | **Alerting**    | Watch the status flips; **Rahul Das** auto-confirms in ≈ 2.4 s. Then click **Proceed to Live Coordination** | "First confirmed donor locks in. The other 9 are paused. We also checked blood banks in parallel." |
| 6 | **Coordination**| Click **Continue Successful Donation** *(or demo the backup flow first: click **Simulate Screening Failure** → Priya Sharma auto-activates)* | "Live ETA, status timeline, parallel blood bank check. If the primary fails screening, backup activates automatically — no dead end." |
| 7 | **Success**     | Click **Run Demo Again** for the next judge             | "Right blood, right donor, right time. Rahul earns 100 LIFE-LINK points and a badge."                |

### Optional 30-second detour
On the **Matching** or **Coordination** screen, click any donor card → a small modal previews the alert the donor receives on their phone (Accept / Unavailable). Use only if a judge asks "what does the donor see?"

### Determinism guarantee
All donor ordering, timing, and outcomes are hard-coded in `src/data/demoData.ts` and `src/context/DemoContext.tsx`. **No randomness** — the demo behaves identically for every judge.

### Reset between judges
- Top-right of every page: **Reset Demo** in the navy bar.
- On the Success page: **Run Demo Again** does the same.

---

## 5. Files in this project

| Path | Purpose |
|---|---|
| `src/data/demoData.ts` | Hospital, donor list, blood banks, recent requests, metrics. Edit to retune. |
| `src/context/DemoContext.tsx` | Demo state machine: stages, donors, alerting choreography, ETA, screening, backup. |
| `src/pages/LoginPage.tsx` | Login screen with role selection. |
| `src/pages/DashboardPage.tsx` | Hospital dashboard with metrics + recent requests. |
| `src/pages/EmergencyRequestPage.tsx` | Verified request form, prefilled for Aarav Mishra / VSS / O- / 2 units. |
| `src/pages/MatchingPage.tsx` | 5-step matching checklist + top 5 donor cards + "Alert Top 10" CTA. |
| `src/pages/AlertingPage.tsx` | Live donor statuses + lock + parallel blood bank check. |
| `src/pages/CoordinationPage.tsx` | Primary donor, animated map, ETA, timeline, screening-failure demo. |
| `src/pages/SuccessPage.tsx` | Success state, donor rewards, badge, run-again. |

---

## 6. Tech stack

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS 3** for styling (no UI kit)
- **React Router 6** for navigation
- **Lucide React** for icons
- No backend, no Firebase, no Twilio, no Maps API, no real auth

---

## 7. Important notes for the team

- The `SIH2026-IDEA-Presentation-Format.pptx.pdf` is the source of truth for the product concept. **Do not modify or delete it.**
- All demo state is in memory. Refreshing the page resets to the login screen — that's by design for a deterministic demo.
- The "Skip animation (Space)" hint on the Matching page is there only as an emergency escape hatch.
- The Screening-Failure button is intentionally small — don't draw attention to it. Use it only if a judge asks "what if the donor can't donate?".

— Async Six · SIH 2026
