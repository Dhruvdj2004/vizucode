import asyncio
import io
import logging
import re
import time

from fastapi import FastAPI, File, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from . import auth, config, llm, storage
from .compiler import CompileError, compile_pdf
from .extractor import ExtractionError, extract_text, missing_lines
from .latex import MAX_FIT, ValidationError, apply_edits, join_tex, render_resume, split_tex, validate_body
from .rebuild import rebuild_from_pdf
from .style import detect_style
from .prompts import EDIT_SYSTEM, EXTRACT_SYSTEM, edit_user_message

log = logging.getLogger("uvicorn.error")
app = FastAPI(title="Resume Editor")
storage.init()


PUBLIC_API = {"/api/login", "/api/logout"}


@app.middleware("http")
async def require_login(request, call_next):
    path = request.url.path
    if path.startswith("/api/") and path not in PUBLIC_API:
        owner = auth.request_owner(request.headers.get("authorization"), request.cookies.get(auth.COOKIE))
        if not owner:
            return JSONResponse(status_code=401, content={"detail": "Please sign in"})
        request.state.owner = owner
    return await call_next(request)


@app.middleware("http")
async def no_stale_frontend(request, call_next):
    # Make browsers revalidate the page and its JS/CSS on every load, so an updated
    # frontend is picked up immediately (unchanged files still return a cheap 304).
    response = await call_next(request)
    path = request.url.path
    if path == "/" or (path.startswith("/static/") and not path.startswith("/static/vendor/")):
        response.headers["Cache-Control"] = "no-cache"
    return response


# Added last so it wraps everything: preflight requests and 401s still get CORS headers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["Content-Disposition"],
)


class LoginRequest(BaseModel):
    email: str = Field(max_length=320)
    password: str = Field(max_length=200)


@app.post("/api/login")
async def login(req: LoginRequest, request: Request):
    ip = request.client.host if request.client else "?"
    if auth.locked_out(ip):
        raise HTTPException(429, "Too many failed attempts. Try again in 15 minutes.")
    if not auth.check_credentials(ip, req.email, req.password):
        await asyncio.sleep(1)  # slow down password guessing
        raise HTTPException(401, "Wrong email or password")
    response = JSONResponse({"status": "ok"})
    response.set_cookie(
        auth.COOKIE,
        auth.make_token(),
        max_age=config.LOGIN_DAYS * 86400,
        httponly=True,
        samesite="lax",
        secure=request.url.scheme == "https",
    )
    return response


@app.post("/api/logout")
def logout():
    response = JSONResponse({"status": "ok"})
    response.delete_cookie(auth.COOKIE)
    return response


class EditRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    provider: str | None = None


def _require_session(request: Request, sid: str):
    row = storage.get_session(sid, request.state.owner)
    if not row:
        raise HTTPException(404, "Session not found")
    return row


def _page_count(pdf: bytes) -> int | None:
    try:
        import pdfplumber

        with pdfplumber.open(io.BytesIO(pdf)) as doc:
            return len(doc.pages)
    except Exception:
        return None


async def _compile_to_fit(data: dict, max_pages: int | None, style: dict | None) -> tuple[str, bytes, int | None]:
    """Compile the rebuilt resume, tightening the layout until it is no longer than the
    uploaded PDF was. Returns (tex, pdf, pages)."""
    for level in range(MAX_FIT + 1):
        tex = render_resume(data, fit=level, style=style)
        pdf = await compile_pdf(tex)
        pages = _page_count(pdf)
        log.info("upload: fit level %d -> %s page(s), target %s", level, pages, max_pages)
        if not max_pages or not pages or pages <= max_pages:
            break
    return tex, pdf, pages


def _decode_tex(content: bytes) -> str:
    # Stored and downloaded as UTF-8, so only UTF-8 files round-trip byte for byte.
    try:
        return content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(400, "This .tex file is not UTF-8. Save it as UTF-8 and upload it again.")


@app.get("/api/config")
def get_config():
    names = llm.available_providers()
    return {"providers": [{"id": n, "label": llm.LABELS[n]} for n in names], "login": auth.enabled()}


async def _structure_resume(text: str, provider: str | None) -> tuple[dict, str]:
    """Ask the LLM for structured JSON, and re-ask if it silently dropped any content."""
    user = f"RESUME TEXT:\n{text}"
    best, best_missing, used = None, None, None
    for attempt in range(config.MAX_EDIT_RETRIES + 1):
        t = time.monotonic()
        data, name = await llm.complete_json_with_provider(EXTRACT_SYSTEM, user, provider)
        missing = missing_lines(text, data)
        log.info("upload: structure attempt %d via %s took %.1fs, %d lines missing",
                 attempt + 1, name, time.monotonic() - t, len(missing))
        if best is None or len(missing) < len(best_missing):
            best, best_missing, used = data, missing, name
        if not missing:
            break
        user = (
            f"RESUME TEXT:\n{text}\n\nYOUR PREVIOUS ANSWER LEFT OUT THESE LINES. Include every one of "
            "them, in its original section and position, and return the complete JSON again:\n"
            + "\n".join(missing)
        )
    return best, used


@app.post("/api/upload")
async def upload(request: Request, file: UploadFile = File(...), provider: str | None = None):
    content = await file.read()
    if len(content) > config.MAX_UPLOAD_BYTES:
        raise HTTPException(413, "File is larger than 5 MB")
    filename = file.filename or "resume"
    owner = request.state.owner

    if filename.lower().endswith(".tex"):
        # The user's own LaTeX is kept exactly as uploaded: no AI, no template.
        tex = _decode_tex(content)
        try:
            split_tex(tex)
            pdf = await compile_pdf(tex)
        except ValidationError as e:
            raise HTTPException(400, str(e))
        except CompileError as e:
            raise HTTPException(
                400,
                "Your LaTeX did not compile on its own. If it needs other files (a .cls, images, "
                f"\\input files), paste them into the .tex. Details: {e}",
            )
        sid = storage.create_session(filename, owner)
        version = storage.add_version(sid, tex, pdf, "Imported your LaTeX exactly as uploaded")
        return {"session_id": sid, "version": version, "provider": None}

    if filename.lower().endswith(".pdf"):
        # First choice: LaTeX that copies the PDF's own layout line by line.
        t = time.monotonic()
        try:
            rebuilt = await rebuild_from_pdf(content, provider)
        except Exception:  # never let this block the template fallback below
            log.exception("upload: layout rebuild crashed")
            rebuilt = None
        log.info("upload: layout rebuild %s in %.1fs", "succeeded" if rebuilt else "failed", time.monotonic() - t)
        if rebuilt:
            tex, pdf, used = rebuilt
            sid = storage.create_session(filename, owner)
            version = storage.add_version(sid, tex, pdf, "Rebuilt from your PDF as LaTeX, copying its layout line by line")
            return {"session_id": sid, "version": version, "provider": llm.LABELS.get(used, used)}

    try:
        text = extract_text(filename, content)
        data, used = await _structure_resume(text, provider)
        is_pdf = filename.lower().endswith(".pdf")
        target = _page_count(content) if is_pdf else None
        style = detect_style(content) if is_pdf else None
        log.info("upload: detected style %s", style)
        t = time.monotonic()
        tex, pdf, pages = await _compile_to_fit(data, target, style)
        log.info("upload: compile took %.1fs", time.monotonic() - t)
    except ExtractionError as e:
        raise HTTPException(400, str(e))
    except llm.LLMError as e:
        raise HTTPException(502, str(e))
    except CompileError as e:
        raise HTTPException(500, f"Could not compile the generated LaTeX: {e}")

    sid = storage.create_session(filename, owner)
    matched = style and style.get("kind") == "classic"
    summary = (
        "Rebuilt from your PDF, matching its font, sizes and margins"
        if matched
        else "Rebuilt from your PDF/DOCX in the built-in LaTeX template"
    )
    if target and pages and pages > target:
        summary += f" (it needs {pages} pages even at the tightest spacing; your file had {target})"
    version = storage.add_version(sid, tex, pdf, summary)
    return {"session_id": sid, "version": version, "provider": llm.LABELS[used]}


@app.post("/api/sessions/{sid}/edit")
async def edit(request: Request, sid: str, req: EditRequest):
    _require_session(request, sid)
    current = storage.get_version(sid)
    head, body, tail = split_tex(current["tex"])

    error = None
    preferred = req.provider
    providers = llm.available_providers()
    for attempt in range(config.MAX_EDIT_RETRIES + 1):
        t = time.monotonic()
        try:
            result, used = await llm.complete_json_with_provider(
                EDIT_SYSTEM, edit_user_message(body, req.message, error), preferred
            )
        except llm.LLMError as e:
            raise HTTPException(502, str(e))
        # If this answer turns out unusable, give the retry to the next provider rather than
        # asking the same (possibly weaker) model again.
        if len(providers) > 1:
            preferred = providers[(providers.index(used) + 1) % len(providers)]

        if result.get("status") == "refused":
            return {"status": "refused", "message": result.get("reason") or "I can only edit your resume."}

        edits = result.get("edits")
        if edits == []:
            return {"status": "unchanged", "message": str(result.get("summary") or "Nothing needed changing.")}
        try:
            # Patches touch only the matched text; the preamble and every other line stay as they are.
            new_body = apply_edits(body, edits)
            if new_body == body:
                raise ValidationError("The patches did not change anything")
            validate_body(body, new_body, head)
            new_tex = join_tex(head, new_body, tail)
            pdf = await compile_pdf(new_tex)
        except (ValidationError, CompileError) as e:
            error = str(e)
            log.info("edit: attempt %d via %s failed after %.1fs: %s", attempt + 1, used, time.monotonic() - t, error[:200])
            continue
        log.info("edit: attempt %d via %s succeeded in %.1fs", attempt + 1, used, time.monotonic() - t)

        summary = str(result.get("summary") or "Updated resume")
        version = storage.add_version(sid, new_tex, pdf, summary, req.message)
        return {"status": "ok", "message": summary, "version": version, "provider": llm.LABELS[used]}

    return JSONResponse(
        status_code=422,
        content={
            "status": "error",
            "message": f"The edit could not be applied safely, so your resume was left unchanged. Last problem: {error}",
        },
    )


@app.get("/api/sessions/{sid}/versions")
def versions(request: Request, sid: str):
    _require_session(request, sid)
    return storage.list_versions(sid)


def _version_or_404(request: Request, sid: str, version: int):
    _require_session(request, sid)
    row = storage.get_version(sid, version)
    if not row:
        raise HTTPException(404, "Version not found")
    return row


def _download_name(request: Request, sid: str, version: int, ext: str) -> str:
    stem = re.sub(r"\.[A-Za-z0-9]+$", "", _require_session(request, sid)["filename"] or "resume")
    stem = re.sub(r"[^A-Za-z0-9._-]+", "_", stem).strip("._") or "resume"
    return f"{stem}_v{version}.{ext}"


@app.get("/api/sessions/{sid}/versions/{version}/pdf")
def version_pdf(request: Request, sid: str, version: int, download: bool = False):
    row = _version_or_404(request, sid, version)
    disposition = "attachment" if download else "inline"
    name = _download_name(request, sid, version, "pdf")
    return Response(
        row["pdf"],
        media_type="application/pdf",
        headers={"Content-Disposition": f'{disposition}; filename="{name}"'},
    )


@app.get("/api/sessions/{sid}/versions/{version}/tex")
def version_tex(request: Request, sid: str, version: int):
    row = _version_or_404(request, sid, version)
    # Sent back exactly as stored: an uploaded .tex with no edits downloads byte-identical.
    return Response(
        row["tex"].encode("utf-8"),
        media_type="application/x-tex; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{_download_name(request, sid, version, "tex")}"'},
    )


@app.post("/api/sessions/{sid}/revert/{version}")
def revert(request: Request, sid: str, version: int):
    row = _version_or_404(request, sid, version)
    new_v = storage.add_version(sid, row["tex"], row["pdf"], f"Reverted to version {version}")
    return {"status": "ok", "version": new_v, "message": f"Reverted to version {version}"}


@app.get("/")
def index():
    return FileResponse(config.STATIC_DIR / "index.html")


app.mount("/static", StaticFiles(directory=config.STATIC_DIR), name="static")
