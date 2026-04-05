"""Quick audit runner with fast heuristics and optional model hook.

This module provides a lightweight, fast "quick scan" to detect common
"Stupid AI" mistakes (eval/exec, obfuscation, shell injection patterns)
without requiring the heavy model to be loaded. A model-based audit hook
is provided but optional.
"""

import os
import json
from typing import List, Dict, Any

DEFAULT_PATTERNS = [
    ("eval(", "Use of eval() is dangerous and should be avoided", "high", "Avoid eval(); prefer ast.literal_eval or explicit parsing."),
    ("exec(", "Use of exec() is dangerous and should be avoided", "high", "Avoid exec(); evaluate alternatives."),
    ("base64.b64decode", "Encoded payloads can hide malicious code", "high", "Decode and inspect payloads; avoid exec on decoded data."),
    ("os.system", "Use of os.system may execute shell commands", "high", "Use subprocess.run with list args and shell=False."),
    ("subprocess.", "Possible subprocess usage", "high", "Prefer subprocess.run without shell or use shlex."),
    ("pickle.", "Pickle can execute arbitrary code on load", "medium", "Use safer serialization formats."),
    ("shell=True", "shell=True may allow shell injection", "high", "Avoid shell=True; pass args as list."),
]


def find_issues_in_text(text: str, path: str = None) -> List[Dict[str, Any]]:
    findings = []
    for i, line in enumerate(text.splitlines(), start=1):
        for pattern, msg, severity, suggestion in DEFAULT_PATTERNS:
            if pattern in line:
                findings.append({
                    "file": path,
                    "line": i,
                    "pattern": pattern,
                    "message": msg,
                    "severity": severity,
                    "suggestion": suggestion,
                })
    return findings


def collect_paths(inputs: List[str]) -> List[str]:
    paths: List[str] = []
    for p in inputs:
        if os.path.isdir(p):
            for root, dirs, files in os.walk(p):
                for f in files:
                    if f.endswith((".py", ".js", ".sh", ".ps1")):
                        paths.append(os.path.join(root, f))
        elif os.path.isfile(p):
            paths.append(p)
    return paths


def run_quick_audit(inputs: List[str]) -> Dict[str, Any]:
    paths = collect_paths(inputs)
    findings: List[Dict[str, Any]] = []
    for p in paths:
        try:
            with open(p, "r", errors="ignore") as fh:
                text = fh.read()
        except Exception:
            continue
        findings.extend(find_issues_in_text(text, path=p))

    summary = {"total_files": len(paths), "total_issues": len(findings)}
    return {"summary": summary, "findings": findings}


def run_model_audit(tokenizer, model, inputs: List[str], max_tokens: int = 256):
    """Run the model to produce suggestions. This is a best-effort hook—model
    outputs are returned raw if JSON parsing fails.
    """
    import torch

    all_outputs = []
    for p in collect_paths(inputs):
        try:
            with open(p, "r", errors="ignore") as fh:
                text = fh.read()
        except Exception:
            continue
        prompt = """
You are a code auditor. For the following source file, list issues (line, severity, message)
in JSON array form. Only output valid JSON.

<CODE>\n""" + text
        enc = tokenizer(prompt, return_tensors="pt", truncation=True, max_length=2048)
        device = next(model.parameters()).device
        enc = {k: v.to(device) for k, v in enc.items()}
        with torch.no_grad():
            out = model.generate(**enc, max_new_tokens=max_tokens, do_sample=False)
        gen = tokenizer.decode(out[0], skip_special_tokens=True)
        try:
            parsed = json.loads(gen)
        except Exception:
            parsed = {"model_raw": gen}
        all_outputs.append({"file": p, "model_output": parsed})
    return all_outputs
