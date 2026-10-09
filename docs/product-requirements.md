# Product Requirements — Universal AI Copilot

**Tagline:** Turn documents, images, and text into understanding and actionable outcomes with Gemma 4.

## 1. Overview

Universal AI Copilot is a multimodal knowledge-to-action workspace. A user supplies a file — a **PDF**, **image**, **screenshot**, **photo**, or **plain text** — and the application reads the content with **Gemma 4**, reasons over it, and produces **structured, actionable output** such as a summary, an explanation, study questions, or a plan.

The product is deliberately *not* a general chat assistant. It is a focused pipeline:

> INPUT → MULTIMODAL UNDERSTANDING → REASONING → STRUCTURED OUTPUT → USER ACTION

## 2. Problem statement

Unstructured content is abundant and under-utilised. Existing chat assistants require manual copy-paste and return prose the user must then interpret and act on themselves, leaving two gaps:

1. **Understanding gap** — determining what a file actually means is manual and slow.
2. **Action gap** — converting understanding into next steps, questions, or study material is a separate chore.

## 3. Goals

- Read real content (visual and textual) directly with Gemma 4 — no fragile OCR pipeline.
- Turn that content into **structured, validated** output for a specific user-chosen purpose.
- Keep the AI path server-side, typed, testable, and safe.
- Be genuinely open source and submission-ready across three hackathon categories.

### Non-goals

- Real-time collaborative editing.
- Persistent storage of user uploads.
- Being a general-purpose chatbot.
- Large-scale document batch processing (roadmap).

## 4. Target users

| User | Need |
| --- | --- |
| Students | Turn slides, notes, and papers into summaries, explanations, and quizzes. |
| Professionals | Extract key points and action items from reports, contracts, and long emails. |
| Developers | Interpret screenshots, logs, and technical docs into next steps. |
| General | Understand and act on content received from others. |

## 5. Functional requirements

### P0 — mandatory

| # | Requirement | Acceptance |
| --- | --- | --- |
| F1 | Upload a file | PDF, PNG, JPG, JPEG, or TXT accepted; invalid types/sizes rejected with a clear message. |
| F2 | Analyze | Returns title, summary, key points, explanation, actions, confidence. |
| F3 | Summarize | Returns a faithful, concise summary of the source. |
| F4 | Explain | Returns a plain-language explanation. |
| F5 | Ask AI | Returns an answer grounded in the uploaded content, for a user-supplied question. |
| F6 | Generate Quiz | Returns question/answer pairs (with explanations) derived from the source. |
| F7 | Create Action Plan | Returns an ordered list of concrete next steps. |

### P1 — polish

- File preview; reset/clear.
- Retry after error.
- Loading/progress state.
- Clean result presentation; copy result as text.
- Responsive layout.

### P2 — optional / roadmap

- Batch uploads, export to Markdown/PDF, server-side caching, streaming, additional actions.

## 6. Non-functional requirements

| Area | Requirement |
| --- | --- |
| Correctness | Output validated against a schema; malformed model output never crashes the UI. |
| Security | API key server-side only; no secret in client; no HTML injection; input validated before use. |
| Reliability | Provider errors mapped to safe, typed messages; timeouts enforced. |
| Performance | Single round-trip per action; bounded prompt/size; configurable timeout. |
| Accessibility | Keyboard navigable, focus-visible, decorative icons hidden, reduced-motion aware. |
| Testability | AI path testable with mocked providers; no live API key required for tests. |
| Maintainability | Layered architecture, strong typing, single source of truth for constants/model. |

## 7. AI requirements

- **Gemma 4 is the core model** and performs all understanding/reasoning (`GEMMA_MODEL`, default `gemma-4-26b-a4b-it`).
- The **Gemini API** is the inference interface, accessed via the official `@google/genai` SDK, server-side only.
- Structured output: request JSON, parse, validate, coerce where reasonable, and fall back safely.
- Grounding: prompts must instruct the model to use the source, avoid inventing facts, state when the source lacks information, and treat uploaded content as untrusted data.
- The model name is configuration, never hardcoded.

## 8. Success criteria

- All P0 actions work end-to-end against a live key.
- Quality gates pass: `lint`, `typecheck`, `test`, `build`.
- No secret is present in the repository or client bundle.
- README and docs accurately describe the implementation.
- The project qualifies for the three targeted hackathon categories on the basis of real code.
