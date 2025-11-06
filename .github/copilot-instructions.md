<!-- .github/copilot-instructions.md -->
# Copilot / AI agent instructions — repository-specific

Purpose
- This repository is a minimal personal/static site. The primary files are `index.html` (site entry) and `README.md` (project info).
- There is no build system, package manager, or tests present. Keep edits small, explicit, and filesystem-local.

Quick contract for the agent
- Inputs: edits requested in issues/PR summary or direct prompts from the user.
- Outputs: small, well-tested edits to HTML/CSS/static assets and updates to `README.md` or new files under the repo root.
- Error modes: avoid adding untracked build tooling (npm, pip) unless the user asks and provides requirements.

What to change and where (concrete examples)
- Update homepage content: modify `index.html` in the repository root. Example: change the title or add a new section directly in `index.html`.
- Add a new page: create `about.html` (or `pages/<name>.html`) and add a link in `index.html`.
- Add assets: create an `assets/` or `images/` directory at the repo root for images, CSS, or JS and reference them by relative paths from `index.html`.
- Documentation changes: update `README.md` for author/bio or usage notes.

Conventions and guardrails (observed from repo)
- No build or task runner detected: do not introduce package.json, Makefile, or docker files unless explicitly requested.
- Keep changes deterministic and local: prefer editing/adding files rather than introducing new services or infra.
- Keep commits atomic and small: one feature or fix per commit/PR (e.g., "feat: add about page" or "fix: correct author bio").

Previewing changes (how I recommend verifying)
- Local preview by opening `index.html` in a browser (macOS): use the Finder or `open index.html` from the project root.
- For multi-file previews, run a simple static server (optional): `python3 -m http.server 8000` then open `http://localhost:8000/`.

When to ask for clarification
- If a change would add a new toolchain (npm, Ruby, Python deps), ask the user for approval and the intended deploy/build flow.
- If the user asks for CI, deployment, or GitHub Pages setup, confirm target branch and whether they'd like an automated workflow added.

Examples of safe edits (copyable guidance)
- "Add a profile section to `index.html` with an image placed in `assets/` and update `README.md` with a short bio."
- "Create `about.html` and link it from `index.html` — include a page title and a short paragraph describing the owner."

Files to reference when making changes
- `/index.html` — main site entry (edit this for homepage changes)
- `/README.md` — repo metadata and bio

If you create new features
- Add small, explanatory comments in HTML and update `README.md` with deployment/preview notes.
- If adding many files, create a brief README fragment in the new folder describing purpose and how to preview.

If this file becomes stale
- Merge existing content intelligently: preserve any user-written guidelines already in `.github/copilot-instructions.md` and keep examples that match the repo.

Please review these instructions and tell me if you'd like stricter commit message rules, a different assets layout, or automated previews added.
