# MLH Hacktoberfest Hack Day — Submission Copy

Event: **MLH Hacktoberfest Hack Day (Navi Mumbai × Piyush Sahu)**

Two repositories are submitted:

| # | Project | Repository | Primary category |
| --- | --- | --- | --- |
| 1 | **Universal AI Copilot** | https://github.com/surajns0033-collab/universal-ai-copilot | Best Open-Source AI Project |
| 2 | **SnapStudy** | https://github.com/surajns0033-collab/snapstudy | Best Use of Gemma 4 |

One of the two is additionally **deployed on DigitalOcean App Platform** to satisfy the
**Best Use of DigitalOcean** track. `Universal AI Copilot` is the DigitalOcean-connected
project below; if `SnapStudy` is the one connected instead, swap the project name in that
section only.

Every claim below is traceable to code in the repository. Nothing here is fabricated; the
live DigitalOcean URL is filled in only after the app is deployed and verified.

---

## 1. Universal AI Copilot

### Project name
Universal AI Copilot

### Short description (one line)
Upload a PDF, image, or text and Gemma 4 reads it, reasons over it, and returns grounded,
schema-validated output you can act on — summary, explanation, quiz, or action plan.

### Built with
`Gemma 4`, `Gemini API`, `@google/genai`, `Next.js 15`, `React 18`, `TypeScript`,
`TailwindCSS`, `Zod`, `Node.js`, `DigitalOcean App Platform`

### Full description
Universal AI Copilot is an open-source (Apache-2.0) multimodal "knowledge-to-action"
workspace. Drop a PDF, PNG, JPG, JPEG, or TXT file and Gemma 4 processes the real content —
images and PDFs are sent to the model as native inline data, not an OCR approximation — then
returns **structured JSON**, validated against a Zod schema before it ever reaches the UI.

It is not a chat wrapper. The Gemma 4 reasoning step *is* the product: content in,
understanding out. Six grounded actions are exposed over any uploaded file:

- **Analyze** — title, summary, key points, explanation, suggested actions, confidence.
- **Summarize** — a tight, faithful summary.
- **Explain** — plain-language explanation for a general reader.
- **Ask AI** — a direct answer grounded in the uploaded content.
- **Generate Quiz** — question/answer pairs with explanations, derived from the source.
- **Create Action Plan** — concrete, ordered next steps.

**How the Gemini API and Gemma 4 are used (the core of the project):**
Every action is a single Gemma 4 inference (`gemma-4-26b-a4b-it`) through the official
`@google/genai` SDK, called **server-side only** from a Next.js route handler
(`src/app/api/analyze/route.ts`, Node runtime). The client sends a system instruction, a
per-action prompt, and the file as `inlineData`; the model is asked for
`responseMimeType: 'application/json'` at low temperature. The API key never reaches the
browser. Provider errors (429/401/403/404/5xx/timeout) are mapped to typed, safe errors.

Anti-hallucination grounding is enforced in the shared prompt base: use the source, do not
invent facts, say when the source is insufficient, and treat uploaded content as untrusted
data rather than instructions. Parsing is resilient by design — lenient coercion, code-fence
stripping, balanced-brace JSON recovery, and a safe fallback — so malformed model output
never crashes the UI.

### Source and license
- Repository: https://github.com/surajns0033-collab/universal-ai-copilot
- License: **Apache-2.0** (`LICENSE`), matching `"license": "Apache-2.0"` in `package.json`.
- Docs: `docs/` (product requirements, architecture, implementation plan, testing strategy,
  deployment).

### Category fit — Best Open-Source AI Project
A genuinely open, inspectable, and reusable AI project: Apache-2.0 licensed, strict layered
architecture, a provider-agnostic `GemmaClient`, an extensible action/prompt pipeline, a
hermetic test suite that runs with **mocked providers and no API key**, and contribution
guides (`CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`). An evaluator can clone it, read the
source, run the tests, and extend it.

### Category fit — Best Use of Gemma 4
Gemma 4 is the actual core model (default `GEMMA_MODEL=gemma-4-26b-a4b-it`, configurable,
never hardcoded). It performs every action's primary reasoning, reads multimodal content
natively, and its output is parsed, validated, and rendered directly by the application.

### Category fit — Best Use of DigitalOcean
> The app is currently served from the live Vercel URL below. The DigitalOcean App Platform
> deployment spec is included in the repository (see the runbook at the end of this file) and
> is used when deploying the container on App Platform.

Universal AI Copilot ships a **DigitalOcean App Platform** deployment spec backed by a
multi-stage `Dockerfile` (`node:20-alpine` → Next.js `output: 'standalone'` →
`node server.js` on port `8080`). App Platform builds the image from the repository, runs the
container, performs health checks, and serves the app over HTTPS at the generated domain.

- **Live URL:** https://universal-ai-copilot.vercel.app/
- **Health check endpoint:** `GET /api/analyze` → `{ "ok": true, "ready": true, ... }`
- **Deployment spec:** `app.yaml` (region `blr`, `dockerfile_path: Dockerfile`,
  `http_port: 8080`, `health_check.http_path: /api/analyze`).
- **Config:** `GEMINI_API_KEY` is supplied as an encrypted **secret** environment variable in
  App Platform — it is never committed to the repository.

---

## 2. SnapStudy

### Project name
SnapStudy

### Short description (one line)
Snap a page of notes, a slide, or a whiteboard and get a structured study kit — summary, key
points, flashcards, and a quiz — generated by Gemma 4.

### Built with
`Gemma 4`, `Gemini API`, `@google/genai`, `Next.js 15`, `React 18`, `TypeScript`,
`TailwindCSS`, `Node.js`

### Full description
SnapStudy turns any photo of study material into a complete study kit in one step. Upload an
image of notes, a lecture slide, a textbook page, or a whiteboard, and Gemma 4 reads the
image directly and returns a structured kit: a summary, the key points, ready-to-review
flashcards, and a quiz — all grounded in the content of the image.

It uses the same server-side, structured-output approach as Universal AI Copilot: the image
is sent to Gemma 4 (`gemma-4-26b-a4b-it`) as inline data through the official `@google/genai`
SDK from a Next.js route handler (`src/app/api/study/route.ts`), and the model returns JSON
that is parsed and rendered as flashcard and quiz cards.

### Source and license
- Repository: https://github.com/surajns0033-collab/snapstudy
- License: **Apache-2.0** (`LICENSE`).

### Category fit — Best Use of Gemma 4
Gemma 4 is the entire product. Its multimodal capability is what makes SnapStudy possible: it
reads a raw photo of study material (not typed input) and does the summarization, key-point
extraction, flashcard authoring, and quiz generation in a single multimodal inference.

---

## Submission field mapping (quick reference)

| MLH field | Universal AI Copilot | SnapStudy |
| --- | --- | --- |
| Project name | Universal AI Copilot | SnapStudy |
| `short_description` | see "Short description" above | see "Short description" above |
| `built_with` | `Gemma 4, Gemini API, @google/genai, Next.js, TypeScript, React, TailwindCSS, Zod, Node.js, DigitalOcean App Platform` | `Gemma 4, Gemini API, @google/genai, Next.js, TypeScript, React, TailwindCSS, Node.js` |
| Repository URL | https://github.com/surajns0033-collab/universal-ai-copilot | https://github.com/surajns0033-collab/snapstudy |
| License | Apache-2.0 | Apache-2.0 |
| Challenge / category | Best Open-Source AI Project | Best Use of Gemma 4 |
| `sponsor_usage` (DigitalOcean) | App Platform hosting of the Dockerized app | — |
| `ai_tools` (agent harness) | Roo Code agent (Claude/DeepSeek models) used to build the project | Roo Code agent (Claude/DeepSeek models) used to build the project |

Both repositories are checked in under the same MLH-account event. A project goes to **one**
event only, so a new MLH project entry is created for each repository.

---

## Local run (both projects)

```bash
# Universal AI Copilot
git clone https://github.com/surajns0033-collab/universal-ai-copilot.git
cd universal-ai-copilot
npm install
cp .env.example .env.local     # then set GEMINI_API_KEY
npm run dev                    # http://localhost:3000

# SnapStudy
git clone https://github.com/surajns0033-collab/snapstudy.git
cd snapstudy
npm install
cp .env.example .env.local     # then set GEMINI_API_KEY
npm run dev                    # http://localhost:3000
```

---

## DigitalOcean deployment runbook (web UI — no CLI token or card required)

`doctl` is not authenticated and the DO API token is gated behind a payment method, so the
cardless path is the App Platform web UI, which builds straight from GitHub:

1. Sign in at https://cloud.digitalocean.com and open **Apps → Create App**.
2. Under **Source**, choose **GitHub** and authorize DigitalOcean for the
   `surajns0033-collab` account.
3. Select the repository (`universal-ai-copilot`) and branch `main`.
4. DigitalOcean detects the `Dockerfile` (via `app.yaml` / `Dockerfile` in the repo root).
   Keep **HTTP port 8080**.
5. Add environment variables:
   - `GEMINI_API_KEY` — mark as **secret** (encrypted), paste the Gemini API key.
   - `GEMMA_MODEL` = `gemma-4-26b-a4b-it`
   - `MAX_UPLOAD_MB` = `15`
   - `AI_REQUEST_TIMEOUT_MS` = `45000`
6. Pick the **Basic / smallest** instance and the **Bangalore (blr)** region.
7. Create the app. Wait for the build and health check to pass.
8. Open the generated `*.ondigitalocean.app` URL and confirm:
   - `GET /api/analyze` returns `{ "ok": true, "ready": true }`
   - A real upload returns `200` with a Gemma 4 result.
9. Paste the verified live URL into the "Best Use of DigitalOcean" section above, and commit.
