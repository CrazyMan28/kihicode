# kihicode

Kihicode is a terminal-first assistant for coding with Claude-style slash commands, pluggable subagents, and an optional web UI.

This repository contains:

- A Node.js-based CLI TUI (`src/`) providing an interactive command palette and agent loop.
- A minimal Web UI that mirrors the agent conversation in your browser (`web/` + `src/server/web.ts`).
- Python security subagent tools in `agent/sucurityagent/` (a separate CLI `kihicode-secure`).

Overview
--------

Kihicode runs locally and can be used in several ways:

- Developer CLI (TypeScript) — run the interactive Node TUI and use slash commands like `/help`, `/login`, `/subagent`, etc.
- Web UI — a lightweight web front-end (WebSocket) that connects to the running agent loop and displays incremental updates.
- Python tools — standalone Python TUI and subagents for scanning and remediation (`agent/sucurityagent`).

Requirements
------------

- Node.js 16+ and `npm` (for the main CLI and web server).
- Optional: Python 3.10+ and `pip` for the Python subagent tools.

Quickstart (Node CLI)
---------------------

1. Install JS dependencies:

```bash
npm install
```

2. Start the development CLI (runs `ts-node src/index.ts`):

```bash
npm run dev
```

3. Use the interactive prompt. Commands are invoked with a leading `/`, for example:

```
/help
/login --provider openai --key <API_KEY>
/subagent start exampleAgent
```

Notes about `/login` and credentials
-----------------------------------

- The Node auth store persists credentials to `~/.kihicode/credentials.json.enc` by default with file perms `600`.
- To enable file encryption set the environment variable `KIHICODE_STORE_PASSPHRASE` before saving credentials. Without that variable the file is stored in plaintext (still with restricted permissions).
- The `/login` command supports `--provider` and `--key` flags or will prompt interactively. Supported provider names include `openai`, `anthropic`, and `huggingface` (provider adapters live under `src/auth/adapters`).

Web UI (browser)
-----------------

The repository includes a minimal web frontend that connects to a local WebSocket server and mirrors agent updates.

Start the web server (serves `web/` and a WS endpoint on `/ws`):

```bash
npm run web
# or to change the port:
KIHICODE_WEB_PORT=4000 npm run web
```

Open your browser to `http://localhost:3000` (or your `KIHICODE_WEB_PORT`). The page provides a small conversation pane and a login button to save credentials into the Node store.

Python tools and subagents
--------------------------

The `agent/sucurityagent/` folder contains a small Python package and a CLI (`kihicode-secure`) for scanning and security-focused subagents.

Install and run the Python tool:

```bash
cd agent/sucurityagent
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .

# then run the CLI
kihicode-secure
# or run the TUI wrapper directly
python ../../tui/tui.py
```

The Python tool stores its configuration (e.g. Mistral API key) in `~/.kihicode/config.json` with restricted file permissions.

Running tests
-------------

- JavaScript tests: `npm test` (uses `vitest`)
- Python tests: from the repo root run `pytest` to run Python test suites under `tests/` and `agent/sucurityagent/tests/`.

Build / Production
------------------

To compile TypeScript into `dist/` and run the production entrypoint:

```bash
npm run build
npm start
```

Environment variables & configuration
------------------------------------

- `KIHICODE_WEB_PORT` — port used by the lightweight web server (default `3000`).
- `KIHICODE_STORE_PASSPHRASE` — when set, the Node auth store will encrypt credentials on disk using AES-GCM.
- Provider-specific environment variables are honored by adapters (see `src/auth/adapters/*`).

Troubleshooting
---------------

- If the Node CLI warns "No LLM configured", set an API key via `/login` or use the web UI to save a key for the provider you want to use.
- If `ts-node` complains about missing type definitions when running `npm run dev`, try installing dev typings: `npm i -D @types/express @types/ws`.
- If the Python TUI suggests installing `prompt_toolkit`, run `pip install prompt_toolkit` inside the Python virtualenv.

Contributing
------------

Contributions welcome — please fork, make changes, and open a pull request. Useful contributions include:

- Adding provider adapters under `src/auth/adapters`
- Improving the web UI under `web/`
- Adding packaged Electron support (an Electron wrapper can load the local web server and provide OS keychain access via `keytar`)

More info
---------

See the Python subagent README for details about the security scanner: `agent/sucurityagent/README.md`.

If you want me to also add an Electron wrapper, OS keychain support (`keytar`) for Node, or automatic discovery/wrapping of Python agents as subagents, tell me which to prioritize and I'll implement it next.
