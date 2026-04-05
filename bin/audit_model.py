#!/usr/bin/env python3
"""CLI shim to run the quick audit or model-backed audit.

Example:
  python3 bin/audit_model.py --files tests/data/sample_bad.py --json
"""

import os
import sys
import json
import argparse

# Ensure project root is on sys.path so `audit` package imports work.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from audit.run_audit import run_quick_audit

try:
    from audit.loader import load_audit_model
except Exception:
    load_audit_model = None


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--files", nargs="+", required=True, help="Files or directories to audit")
    p.add_argument("--json", action="store_true", help="Print JSON output")
    p.add_argument("--use-model", action="store_true", help="Attempt model-based audit (optional)")
    p.add_argument("--lora-dir", default=None, help="Path to LORA adapter directory inside the project")
    p.add_argument("--base-model", default=None, help="Base model id/path for model-backed audit")
    args = p.parse_args()

    if args.use_model and load_audit_model is None:
        print("Model-based audit requested but loader is unavailable (missing dependencies). Falling back to quick scan.", file=sys.stderr)
        args.use_model = False

    if not args.use_model:
        report = run_quick_audit(args.files)
        if args.json:
            print(json.dumps(report, indent=2))
        else:
            s = report.get("summary", {})
            print(f"Scanned {s.get('total_files',0)} files, found {s.get('total_issues',0)} issues")
            for f in report.get("findings", [])[:50]:
                print(f"- {f['file']}:{f['line']} [{f['severity']}] {f['message']}")
        return 0

    # Model-backed audit (best-effort)
    tokenizer, model, device = load_audit_model(args.lora_dir, base_model=args.base_model)
    from audit.run_audit import run_model_audit
    outputs = run_model_audit(tokenizer, model, args.files)
    if args.json:
        print(json.dumps(outputs, indent=2))
    else:
        for o in outputs:
            print(f"Model audit for {o['file']}:\n{o['model_output']}\n")


if __name__ == "__main__":
    sys.exit(main())
