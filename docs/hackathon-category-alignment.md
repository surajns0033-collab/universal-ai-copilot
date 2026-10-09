# Hackathon Category Alignment — Universal AI Copilot

Event: **MLH Hacktoberfest Hack Day (Navi Mumbai × Piyush Sahu)**

This project targets three categories. Each claim below maps to **actual source code** — no vague "powered by AI" statements.

---

## 1. Best Use of Gemma 4 — Google DeepMind

**Claim: Gemma 4 is the core intelligence of the product, not a cosmetic integration.**

| Criterion | Evidence in code |
| --- | --- |
| Gemma 4 is the actual core model | Default `GEMMA_MODEL=gemma-4-26b-a4b-it` in [`.env.example`](../.env.example) and `DEFAULT_GEMMA_MODEL` in [`src/config/constants.ts`](../src/config/constants.ts). |
| The model performs the product's primary work | Every action (Analyze, Summarize, Explain, Ask AI, Quiz, Action Plan) is a Gemma inference driven by per-action prompts in [`src/lib/ai/prompts`](../src/lib/ai/prompts). |
| Multimodal content is processed | Images/PDFs are attached as inline data (`inlineData`) in [`src/lib/ai/gemma-client.ts`](../src/lib/ai/gemma-client.ts), so Gemma reads the actual content. |
| Output is used directly by the application | The response is parsed/validated by [`src/lib/ai/parser.ts`](../src/lib/ai/parser.ts) + [`schemas.ts`](../src/lib/ai/schemas.ts) and rendered by [`ResultPanel`](../src/features/copilot/components/ResultPanel.tsx). |
| The model is invoked through a dedicated abstraction | [`GemmaClient`](../src/lib/ai/gemma-client.ts) is the single provider call site. |
| Grounded behaviour (anti-hallucination) | Grounding rules in [`src/lib/ai/prompts/base.ts`](../src/lib/ai/prompts/base.ts): use the source, avoid inventing facts, say when the source is insufficient, treat uploaded content as untrusted. |

**Why Gemma 4 is essential here:** the entire value proposition — reading a screenshot or PDF and returning a grounded, structured understanding — is the Gemma 4 call. Remove it and there is no product.

> **Note on the model identifier.** Gemma 4 is the core model. The identifier is **configurable** via `GEMMA_MODEL` (never hardcoded); the shipped default is `gemma-4-26b-a4b-it`. The identifier can be changed without touching application logic, so the project tracks the Gemma family as it evolves.

---

## 2. Best Open-Source AI Project — DigitalOcean

**Claim: a genuinely open, inspectable, and reusable AI project.**

| Criterion | Evidence |
| --- | --- |
| Public source repository | The project is structured for public release with a documented layout and setup (see [`README.md`](../README.md)). |
| Open-source license | **Apache-2.0** in [`LICENSE`](../LICENSE), matching `"license": "Apache-2.0"` in [`package.json`](../package.json). |
| Runs on an open-weight model | **Gemma 4** is an open-weight model family, invoked through the Gemini API. |
| AI is a core product component | The AI layer ([`src/lib/ai`](../src/lib/ai)) implements the product's central function; it is not bolted on. |
| Code is inspectable and reusable | Strict layering (see [`architecture.md`](architecture.md)); a provider-agnostic `GemmaClient`; a generic action/prompt pipeline that is extensible to new actions and file types. |
| Contribution-ready | [`CONTRIBUTING.md`](../CONTRIBUTING.md) (setup, quality gates, architecture rules, PR process) and [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md). |
| Project documentation | [`docs/`](.) — product requirements, architecture, implementation plan, testing strategy, deployment. |
| Tested | A hermetic test suite with mocked providers (see [`testing-strategy.md`](testing-strategy.md)). |
| No secrets committed | [`.env.example`](../.env.example) documents variables; [`.gitignore`](../.gitignore) excludes `.env*`. |

**Why it qualifies:** an evaluator can clone the repository, read the layered source, run the tests without a key, and extend the product — the AI is central, documented, and reusable.

---

## 3. Best Use of Gemini API — Event Prize

**Claim: the Gemini API is used in the actual production inference path.**

| Criterion | Evidence in code |
| --- | --- |
| Official SDK, real call | [`src/lib/ai/gemma-client.ts`](../src/lib/ai/gemma-client.ts) uses the official `@google/genai` SDK (`models.generateContent`). |
| Content and instructions are sent to the API | The client sends a system instruction, the user prompt, and the file as `inlineData`. |
| Structured output requested from the API | `responseMimeType: 'application/json'` with a low temperature, so the API returns machine-usable JSON. |
| Results used directly by the application | The API response is validated and surfaced to the UI without manual post-processing. |
| Server-side only | The call happens in a Next.js route handler ([`src/app/api/analyze/route.ts`](../src/app/api/analyze/route.ts), Node runtime); the key is never sent to the browser. |
| Robust API error handling | [`normalizeProviderError`](../src/lib/ai/gemma-client.ts) maps 429/401/403/404/5xx/timeout to typed, safe errors. |
| Configurable model | The API is called with the configured `GEMMA_MODEL`, keeping the interface stable across model updates. |

**Why it qualifies:** the Gemini API is not called for a checkbox — it is the single inference path that makes the entire product function, used with structured output and proper error handling, entirely server-side.

---

## Summary

| Category | Single strongest piece of evidence |
| --- | --- |
| Best Use of Gemma 4 | Multimodal inline-data call to `gemma-4-26b-a4b-it` in [`gemma-client.ts`](../src/lib/ai/gemma-client.ts), grounded by [`prompts/base.ts`](../src/lib/ai/prompts/base.ts). |
| Best Open-Source AI Project | Apache-2.0 [`LICENSE`](../LICENSE) + layered, tested, documented [`src/lib/ai`](../src/lib/ai) + contribution guides. |
| Best Use of Gemini API | `@google/genai` `models.generateContent` with `application/json` output on the production path, server-side only. |
