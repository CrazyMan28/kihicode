import meow from 'meow';
export function parseArguments() {
    const cli = meow(`
    Usage
      $ kihicode [command]

    Options
      --yolo, -y  Run in YOLO mode (auto-execute without permission)
      --verbose, -v Show detailed logs

    Commands
      /plan     Architect mode
      /build    Agentic mode
      /login    Set API keys
      /help     Show help

    Examples
      $ kihicode /build "Create a new React project"
  `, {
        importMeta: import.meta,
        flags: {
            yolo: {
                type: 'boolean',
                shortFlag: 'y'
            },
            verbose: {
                type: 'boolean',
                shortFlag: 'v'
            }
        }
    });
    return {
        command: cli.input.join(' '),
        flags: cli.flags
    };
}
//# sourceMappingURL=args.js.map