# Commands Reference

This file lists built-in slash commands available in kihicode.

Essential commands:

- `/help` - Show available commands or details for a command
- `/login` - Login to an AI provider (flags: `--provider <name>` `--key <apiKey>`)
- `/logout` - Remove stored credentials for a provider
- `/clear` - Clear the screen
- `/status` - Show session status and providers
- `/add-dir` - Add a directory to project context
- `/context` - Show indexed context directories and files
- `/remember` - Save a small note to memory
- `/memory` - List memory notes
- `/forget` - Forget a memory item by id
- `/subagent` - Manage background subagents: start/list/status

Custom commands may be placed in `.kihicode/commands` as `.ts` or `.js` modules exporting a default `Command`.
