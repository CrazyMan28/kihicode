#!/usr/bin/env python3
"""Launcher for the Textual-based Kihicode TUI.

This launcher attempts to start the Textual TUI. If `textual` is not
installed it will print an installation hint and exit.

Run:

    python3 bin/kihicode_tui.py

"""
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from tui.textual_app import run_textual_app
except Exception:
    run_textual_app = None


def main():
    if run_textual_app is None:
        print("Textual TUI is unavailable. Ensure 'tui/textual_app.py' is present and install 'textual' with: pip install textual")
        return 2
    return run_textual_app()


if __name__ == "__main__":
    raise SystemExit(main())
