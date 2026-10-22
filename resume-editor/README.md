# Resume Editor

Upload a resume (.tex/PDF/DOCX/TXT) → chat to edit it → get the PDF and LaTeX.
The AI only edits resume content; the layout (preamble) is locked and every edit is
validated and compiled before it's saved.

**Your LaTeX is never rewritten.** An uploaded `.tex` is stored exactly as uploaded (no AI,
no template) and downloads byte-identical. Edits are small find/replace patches on the lines
the request is about, so every other character, including spacing and comments, stays the same.
PDF/DOCX/TXT uploads are first rebuilt in the built-in template, then the same rule applies.

## In VizuCode

This service backs the `#/resume` page of VizuCode (`src/pages/ResumePage.tsx`). It runs
separately because compiling LaTeX needs Tectonic, which Vercel can't run.

- Here: set `VIZUCODE_JWT_SECRET` to VizuCode's `JWT_SECRET`, and `CORS_ORIGINS` to the site.
- In VizuCode (Vercel): set `VITE_RESUME_API_URL` to this service's URL (default
  `http://localhost:8000` for local dev).

Signed-in VizuCode users send their token as `Authorization: Bearer …`; each sees only their own
resumes. The standalone page at `/` still works with the `APP_EMAIL`/`APP_PASSWORD` login.

## Run

```bash
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env         # then add at least one API key (see below)
uvicorn app.main:app --reload --port 8000
```

Open http://localhost:8000. Requires `tectonic` (`brew install tectonic`); the first
compile downloads LaTeX packages, so it takes longer.

## Deploy (Docker)

The `Dockerfile` installs Tectonic and pre-downloads the LaTeX packages at build time, so it
runs on any Docker host (Render, Railway, Fly.io). `render.yaml` is a ready Render Blueprint.

Set these on the host: your AI key(s), plus `APP_EMAIL` and `APP_PASSWORD` so only that account
can sign in. Resumes live in SQLite under `DATA_DIR` (`/data` in the image); mount a persistent
disk/volume there, or they are lost when the service restarts.

## AI providers

Add one or more keys to `.env`. Providers are tried in `PROVIDER_ORDER`; if one is busy,
rate-limited or returns an unusable edit, the next configured one is used automatically.

| Provider | Key | Default model |
|---|---|---|
| Groq | `GROQ_API_KEY` | `openai/gpt-oss-120b` |
| Cerebras | `CEREBRAS_API_KEY` | `gpt-oss-120b` |
| Gemini | `GEMINI_API_KEY` | `gemini-3.8-flash` |
| OpenRouter | `OPENROUTER_API_KEY` | free models, comma-separated as backups |

Restart the server after changing `.env`.

## Layout

| File | Role |
|---|---|
| `app/main.py` | API routes: upload, edit, versions, revert, downloads |
| `app/prompts.py` | System prompts (extraction + resume-only editor) |
| `app/llm.py` | Provider layer with automatic fallback (JSON mode) |
| `app/extractor.py` | PDF/DOCX text extraction (keeps bold + columns) and completeness check |
| `app/latex.py` | Template rendering, locked/editable split, edit validator |
| `app/templates/resume.tex.j2` | The LaTeX resume template |
| `app/compiler.py` | Tectonic compile (`--untrusted`, timeout, temp dir) |
| `app/storage.py` | SQLite version history |
| `app/auth.py` | Single-account login (signed cookie) |
| `static/` | Frontend (chat + PDF.js preview) |

## Edit pipeline

request → LLM gets only the body (between `%%BODY_START`/`%%BODY_END`, or between
`\begin{document}`/`\end{document}` for an uploaded .tex) → it returns find/replace patches,
each of which must match exactly one place → validator (section markers intact, no new
forbidden/unknown commands, balanced braces/environments, all relative to the old body) →
compile → save as new version. On failure the error is fed back to the next provider
(2 retries); if it still fails, the resume is left unchanged.
