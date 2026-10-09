# Deploying Universal AI Copilot to DigitalOcean (free tier)

This runbook deploys the app to **DigitalOcean App Platform** on the
**`apps-s-1vcpu-0.5gb`** instance size — DigitalOcean's current free plan. (The legacy
alias `basic-xxs` still maps to the same free plan, but it is marked *deprecated* in the
[API spec](https://docs.digitalocean.com/reference/api/), so the current slug is used.)
App Platform builds the repository's multi-stage [`Dockerfile`](../Dockerfile)
(`node:20-alpine` → Next.js `output: 'standalone'` → `node server.js` on port `8080`), runs the
container, performs the health check, and serves it over HTTPS.

There are two ways to deploy. Pick one.

| Path | Needs a DO token? | Needs a card? | Best for |
| --- | --- | --- | --- |
| **A — One command** (`npm run deploy:do`) | Yes | Yes (for account verification) | Fast, reproducible, keeps the spec in the repo |
| **B — Web UI import** | No | Yes (for account verification) | You have no token handy |

Both produce the same result: an App Platform app named `universal-ai-copilot` running on the
free instance size.

---

## Prerequisites (both paths)

1. **DigitalOcean account** — <https://cloud.digitalocean.com/registrations/new>
   A card is required for account verification, but the app itself runs on the free
   `apps-s-1vcpu-0.5gb` instance size.
2. **A Gemini API key** with access to the Gemma model — <https://aistudio.google.com/app/apikey>
3. The repository is **public** — <https://github.com/surajns0033-collab/universal-ai-copilot>
   App Platform can pull a public repo without a GitHub OAuth connection.

> **Secret handling.** `GEMINI_API_KEY` is entered with *hidden* input, sent to DigitalOcean,
> and stored as an encrypted `SECRET` environment variable. It is never printed, never written
> to disk by this repo's tooling, and never committed.

---

## Path A — One command (token-based, no `doctl` needed)

The script talks to the DigitalOcean **REST API v2** directly, so it does **not** require the
`doctl` CLI to be installed. It creates the app if it is missing, or updates it if it already
exists (so re-running is safe and idempotent).

### 1. Create a Personal Access Token

DigitalOcean → **API** → **Tokens** → **Generate New Token**, with **read + write** scope for
App Platform. Copy it once — it is shown only once.

### 2. Run the deploy

From the repository root:

```powershell
npm run deploy:do
```

Then paste the two hidden prompts: the **DigitalOcean token** and the **Gemini API key**.
Nothing you paste is echoed to the screen.

Equivalent raw invocation:

```powershell
powershell -NoProfile -File scripts/deploy-do.ps1 -Create
```

To update an existing app explicitly:

```powershell
powershell -NoProfile -File scripts/deploy-do.ps1 -Update -AppId <APP_ID>
```

### 3. Read the output

The script prints the **App id** and the **Live URL**. The URL looks like:

```
https://universal-ai-copilot-<random>.ondigitalocean.app
```

The **first** deploy takes several minutes (the container image is built). Watch progress at
<https://cloud.digitalocean.com/apps/>.

---

## Path B — Web UI import (no token)

1. DigitalOcean → **Apps** → **Create App** → **GitHub**.
2. Authorise DigitalOcean to read GitHub, then select
   **`surajns0033-collab/universal-ai-copilot`** and branch **`main`**.
3. DigitalOcean detects the [`Dockerfile`](../Dockerfile). If it asks, choose **Dockerfile**
   as the build type.
4. Set:
   - **HTTP port:** `8080`
   - **Instance size:** `apps-s-1vcpu-0.5gb` (the free tier)
   - **Region:** `blr` (Bangalore)
   - **Health check:** HTTP `GET /api/analyze`
5. Add environment variables:

   | Key | Value | Type |
   | --- | --- | --- |
   | `GEMINI_API_KEY` | *your key* | **Secret** (encrypted) |
   | `GEMMA_MODEL` | `gemma-4-26b-a4b-it` | Plain |
   | `MAX_UPLOAD_MB` | `15` | Plain |
   | `AI_REQUEST_TIMEOUT_MS` | `45000` | Plain |

6. (Optional) Under **App-Level Settings**, enable **Automatically deploy on push** for `main`
   so the live URL tracks the repository.
7. **Create Resources** → wait for the build → copy the generated live URL.

The [`app.yaml`](../app.yaml) in the repository matches these settings, so you can also use it
as a reference or with the CLI (`doctl apps create --spec app.yaml`).

---

## Verify the deployment

```bash
curl https://<your-app>.ondigitalocean.app/api/analyze
```

Expected `200`:

```json
{ "success": true, "data": { "ready": true, "model": "gemma-4-26b-a4b-it", "maxUploadBytes": 15728640 } }
```

Then open the root URL, upload a small file, and run **Analyze** — a structured result (not a
`CONFIGURATION_ERROR`) confirms the key is wired correctly.

### Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| App stays in **Building** | First Docker build is slow | Wait a few minutes |
| Health check failing | Wrong HTTP port | Set **HTTP port** to `8080` |
| `CONFIGURATION_ERROR` | `GEMINI_API_KEY` missing/blank | Re-set it as a **Secret** env var, then redeploy |
| `CONFIGURATION_ERROR` mentions the model | Model id not accessible with the key | Verify `GEMMA_MODEL` and key access |
| `413` / body too large | Platform body limit below upload | Reduce `MAX_UPLOAD_MB` or raise the limit |
| Build fails on the API route | Runtime not Node | Ensure `export const runtime = 'nodejs'` is present |

---

## Updating the live URL in the docs

Once the App Platform URL exists, record it:

- [`README.md`](../README.md) — the **Live demo** line.
- [`docs/submission.md`](submission.md) — the **Live URL** field and the *Best Use of
  DigitalOcean* category block.

Keeping both URLs listed is honest and useful: Vercel is the primary demo, DigitalOcean is the
container-based deployment for the DigitalOcean categories.
