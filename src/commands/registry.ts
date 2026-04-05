import { Command } from './Command.js';
import { parseSlash } from './parser.js';

export class CommandRegistry {
  private commands: Map<string, Command> = new Map();

  register(cmd: Command) {
    if (!cmd || !cmd.name) throw new Error('Invalid command');
    this.commands.set(cmd.name, cmd);
  }

  list(): Command[] {
    return Array.from(this.commands.values());
  }

  get(name: string): Command | undefined {
    return this.commands.get(name);
  }

  async execute(rawInput: string, ctx: any) {
    try {
      const { name, args } = parseSlash(rawInput);
      if (!name) {
        ctx.stdout('No command provided.');
        return;
      }
      const cmd = this.get(name);
      if (!cmd) {
        ctx.stdout(`Unknown command: /${name}`);
        return;
      }
      await cmd.execute(ctx, args);
    } catch (err: any) {
      ctx.stdout('Error executing command: ' + (err?.message ?? String(err)));
    }
  }
}
