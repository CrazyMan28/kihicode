# kihicode-secure

A small TUI tool to scan and help secure "vibe" codebases. Provides:

- Scanning for common secrets and insecure file permissions
- Optional AI-assisted plan generation using a Mistral API key
- Simple automatic fixes with backups for safe operations

Quick start

1. Create a virtualenv and install:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install -e .
```

2. Run the TUI:

```bash
kihicode-secure
```

3. From the menu, set your Mistral API key, run a scan, and ask the AI to generate a plan.

Notes

- The Mistral API key is stored in `~/.kihicode/config.json` with restricted file permissions (600).
- Automatic fixes create `.bak` backups before changing files.
- The Mistral API endpoint may need to be configured via `MISTRAL_API_URL` if your provider uses a custom URL.

Non-interactive usage

You can run the CLI non-interactively from any terminal (the wrapper `kihicode-secure` is provided):

- Scan a directory and print JSON:

```bash
kihicode-secure --scan path/to/repo --json
```

- Apply conservative fixes (creates backups) non-interactively:

```bash
kihicode-secure --scan path/to/repo --fix --yes
```

- Save a Mistral API key for AI plans:

```bash
kihicode-secure --set-key YOUR_MISTRAL_KEY_HERE
```

- Ask the AI to generate a plan, optionally including findings from a prior `--scan`:

```bash
kihicode-secure --scan . --ai-plan "Create a security plan for this repo" --include-findings
```

If `~/.local/bin` is not in your PATH, add it to your shell startup file (e.g. `~/.profile` or `~/.zshrc`):

```bash
export PATH="$HOME/.local/bin:$PATH"
```

Security subagent (`/security`)

You can invoke a security-focused subagent that scans a repository and (optionally) uses Mistral to generate a remediation plan. It will try to locate a `kihicode` repository automatically (current working directory, then `~/Downloads`), or you can pass an explicit path.

Examples:

```bash
# Scan and get a local heuristic plan (no Mistral key required):
kihicode-secure /security --path path/to/repo

# Use remote Mistral to generate a plan (requires API key saved via --set-key or MISTRAL_API_KEY env var):
kihicode-secure /security --path path/to/repo --ai

# Apply conservative fixes after scanning:
kihicode-secure /security --path path/to/repo --apply --yes
```

Important: the subagent refuses to use a Mistral URL that looks local (e.g. localhost or 127.0.0.1). By default it uses the remote Mistral API at `https://api.mistral.ai/v1` unless you set `MISTRAL_API_URL` or the persisted config. If you set a custom `MISTRAL_API_URL`, ensure it is a remote endpoint.

Interactive TUI

The project includes a lightweight interactive TUI (requires `prompt_toolkit`) that provides a command-palette experience.

- Launch it by running the wrapper from any terminal:

```bash
kihicode-secure
```

- Press `/` then `Tab` to open the command palette; use the arrow keys to navigate commands and press Enter to run the selected command.

- Example quick commands in the palette:

```
/scan .
/scan --json
/scan --fix --yes
/security --path . --ai
/security --path . --apply --yes
/set-key <KEY>
/ai-plan "Create a security plan"
```

If `prompt_toolkit` is not installed, the CLI gracefully falls back to the previous simple interactive menu.
