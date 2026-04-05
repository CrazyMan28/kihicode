#!/usr/bin/env python3
"""Kihicode TUI — command-palette that invokes the agent script.

Start this from the `~/Downloads/kihicode` project directory. Type `/` then Tab
to open the command palette; use arrows to choose and Enter to run.

This module uses `prompt_toolkit`. If it's not installed the script will instruct
you how to install it.
"""
from __future__ import annotations
import shlex
import subprocess
import sys
from pathlib import Path
from typing import List, Iterable

try:
    from prompt_toolkit import PromptSession
    from prompt_toolkit.completion import Completer, Completion
    from prompt_toolkit.styles import Style
    from prompt_toolkit.widgets import TextArea, Frame
    from prompt_toolkit.application import Application
    from prompt_toolkit.layout import Layout
    from prompt_toolkit.key_binding import KeyBindings
except Exception:
    PromptSession = None
    Completer = None
    Completion = None
    Style = None
    TextArea = None
    Frame = None
    Application = None
    Layout = None
    KeyBindings = None


# Agent script we will invoke (relative to this file)
AGENT_SCRIPT = Path(__file__).resolve().parent.parent / "agent" / "kihicode-secure"


def _static_commands() -> List[str]:
    return [
        "scan .",
        "scan --json",
        "scan --fix --yes",
        "/security --path .",
        "/security --path . --ai",
        "/security --path . --apply --yes",
        "set-key <KEY>",
        'ai-plan "Create a security plan"',
        "help",
        "exit",
    ]


# Fallback base class when prompt_toolkit Completer is not available
BaseCompleter = Completer if Completer is not None else object
if Completion is None:
    class Completion:  # type: ignore
        def __init__(self, text: str, start_position: int = 0):
            self.text = text
            self.start_position = start_position


class SlashCompleter(BaseCompleter):
    def __init__(self, commands: Iterable[str]):
        self.commands = list(commands)

    def get_completions(self, document, complete_event):
        text = document.text_before_cursor
        if not text.startswith("/"):
            return
        prefix = text[1:]
        for cmd in self.commands:
            if cmd.startswith(prefix):
                yield Completion("/" + cmd, start_position=-len(text))


def _run_agent(args: List[str]) -> str:
    cmd = [str(AGENT_SCRIPT)] + args
    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, check=False)
        return proc.stdout
    except Exception as e:
        return f"Error running agent: {e}"


def _show_output(output: str):
    if Application is None or TextArea is None:
        print(output)
        try:
            input("\nPress Enter to continue...")
        except Exception:
            pass
        return

    textarea = TextArea(text=output, scrollbar=True, wrap_lines=False, read_only=True)
    frame = Frame(textarea, title="Output (press 'q' or Esc to return)")
    kb = KeyBindings()

    @kb.add("q")
    @kb.add("escape")
    def _quit(event):
        event.app.exit()

    app = Application(layout=Layout(frame), key_bindings=kb, full_screen=True)
    app.run()


def run_tui():
    if PromptSession is None:
        print("prompt_toolkit is not installed. Install it with: python -m pip install prompt_toolkit")
        sys.exit(1)

    commands = _static_commands()
    session = PromptSession(completer=SlashCompleter(commands), style=Style.from_dict({"prompt": "#00ffff"}))
    print("Kihicode TUI — type '/' then Tab to see commands; use arrows and Enter to run. Type /exit to quit.")

    while True:
        try:
            text = session.prompt("> ")
        except (KeyboardInterrupt, EOFError):
            break

        if not text:
            continue
        cmdline = text.strip()
        if cmdline.startswith("/"):
            cmdline = cmdline[1:].strip()
        if not cmdline:
            continue
        if cmdline in ("exit", "quit"):
            break
        if cmdline == "help":
            print("\nCommands:\n" + "\n".join("/" + c for c in commands))
            continue

        tokens = shlex.split(cmdline)
        if not tokens:
            continue

        verb = tokens[0]
        args: List[str] = []

        if verb == "scan":
            directory = tokens[1] if len(tokens) > 1 else "."
            args = ["--scan", directory]
            if "--json" in tokens:
                args.append("--json")
            if "--fix" in tokens:
                args.append("--fix")
            if "--yes" in tokens:
                args.append("--yes")
        elif verb == "security":
            args = ["/security"] + tokens[1:]
        elif verb == "set-key":
            if len(tokens) > 1:
                key = tokens[1]
            else:
                key = session.prompt("Mistral API key: ", is_password=True)
            args = ["--set-key", key]
        elif verb == "ai-plan":
            if len(tokens) > 1:
                prompt = " ".join(tokens[1:])
            else:
                prompt = session.prompt("AI prompt: ")
            args = ["--ai-plan", prompt]
            if "--include-findings" in tokens:
                args.append("--include-findings")
        else:
            args = tokens

        output = _run_agent(args)
        _show_output(output)

    print("Exiting Kihicode TUI.")


if __name__ == "__main__":
    run_tui()
