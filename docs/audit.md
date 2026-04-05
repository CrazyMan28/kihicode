# Audit integration for `kihicode`

This document describes the lightweight audit integration that was added and
how to use it. The integration provides a fast heuristic "quick-scan" and a
best-effort model-backed audit hook (LORA/PEFT) that you can enable if you
have the dependencies and hardware.

Files added
- `kihicode/audit/loader.py` — model loader (PEFT/LORA), GPU-aware
- `kihicode/audit/run_audit.py` — quick-scan heuristics + optional model hook
- `kihicode/bin/audit_model.py` — CLI shim for headless audits
- `kihicode/tui/commands_audit.py` — small helper function for TUI integration
- `kihicode/tui/commands.py` — TUI registration shim (`register_audit_command`)
- `tests/test_audit_runner.py` — simple smoke test
- `tests/data/sample_bad.py` — sample file used by the smoke test

Requirements

Recommended Python environment and packages (optional GPU support):

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

The critical packages for model-backed audits are:

- `transformers`
- `peft`
- `torch` (CPU or CUDA build)
- `accelerate` (optional)
- `bitsandbytes` (optional, for 8-bit GPU)

Quick CLI usage (quick-scan)

Run a fast heuristic scan (no model required):

```bash
python3 bin/audit_model.py --files tests/data/sample_bad.py --json
```

Or for a short, human-friendly summary:

```bash
python3 bin/audit_model.py --files tests/data/sample_bad.py
```

Model-backed audit (best-effort)

If you want to use the LORA adapter that was copied into
`kihicode/models/audit`, install the packages above and provide a base model
id/path. Example (GPU recommended):

```bash
python3 bin/audit_model.py --use-model --lora-dir kihicode/models/audit \
  --base-model <hf-base-model-id> --files path/to/code --json
```

Notes:
- Model-backed outputs are best-effort and may require prompt tuning.
- On CPU the model-backed audit will be slow; prefer a CUDA GPU.

TUI integration

The TUI helper is available as `audit_handler(files)` in
`kihicode/tui/commands_audit.py`. To register a `/audit` command in your TUI,
call the adapter in `kihicode/tui/commands.py`:

```python
from tui.commands import register_audit_command

def my_register(name, handler):
    # adapt to your TUI's registration API
    registry.add(name, handler)

register_audit_command(my_register)
```

The handler receives an iterable of file paths and returns the report dict
(`{"summary":..., "findings": [...]}`). The quick-scan is the default for
fast responsiveness.

Copying the LORA adapter into the project

If you want to keep a local copy of the LORA adapter, place it at
`kihicode/models/audit`. To copy from another location (example used here):

```bash
mkdir -p kihicode/models/audit
rsync -a --progress /home/user/create_model/sentry/vibe_sentry/model/vibe_sentry_lora/ kihicode/models/audit/
# Verify checksums
(cd /home/user/create_model/sentry/vibe_sentry/model/vibe_sentry_lora && find . -type f -exec sha256sum {} \; | sort > /tmp/audit_model_src.sha256)
(cd kihicode/models/audit && find . -type f -exec sha256sum {} \; | sort > /tmp/audit_model_dst.sha256)
diff -u /tmp/audit_model_src.sha256 /tmp/audit_model_dst.sha256 || true
```

By default the `models/audit` directory contains a `.gitignore` to avoid
committing large binary weights. Keep the model files out of source control
unless you intentionally want to track them.

Running the tests

Run the simple smoke test we added:

```bash
python3 -m pytest -q tests/test_audit_runner.py
```

Committing changes (suggested)

This repository isn't a git repo by default. To initialize and commit the new
files (excluding model weights):

```bash
git init
echo "kihicode/models/audit/*" >> .gitignore
git add .
git commit -m "Add audit quick-scan, CLI, TUI helper, and docs"
```

Troubleshooting

- If `transformers` or `peft` is missing you'll see an error when requesting
  model-backed audits; install the packages into your virtualenv as above.
- If GPU is not found, the loader will fall back to CPU (model-backed audits
  may be extremely slow on CPU).
- If model PEFT/LORA loading fails, the code keeps the base model where
  possible and continues with best-effort behavior.

Next steps and optional improvements

- Wire `register_audit_command` into your real TUI registry for interactive use.
- Add a `requirements.txt` (provided) and/or a `pyproject.toml` to pin deps.
- Add a small manifest (`models/audit/MANIFEST.txt`) if you want to track
  checksums without committing large weights.

If you want, I can (A) initialize a git repo and commit the new code (excluding
  model weights), (B) install the model deps and run a model-backed audit,
  or (C) wire the TUI registration into a specific command registry — tell
which option you prefer.

Run the new interactive TUI

Start the new Textual-based TUI launcher from the project root:

```bash
python3 bin/kihicode_tui.py
```

Behavior:
- Press `/` to open the command palette. Type to filter commands and press Enter to run.
- Use the Up/Down/Page keys to scroll the main feed.
- `/audit <paths>` will run a quick-scan audit and show results in the feed.

Note: The new TUI is implemented using the `textual` framework. Install it with:

```bash
pip install textual
```

If you prefer a dependency-free TUI the previous curses implementation can be
restored from version history, but `textual` provides a far richer UX for
command palettes, overlays, and layout.
