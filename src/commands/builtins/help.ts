import { Command } from '../Command';

const helpCommand: Command = {
  name: 'help',
  description: 'Show available commands or details for a command',
  execute(ctx, args) {
    const registry = ctx.registry;
    if (!args || args.length === 0) {
      const list = registry.list();
      const lines = list.map((c: any) => `/${c.name} - ${c.description || ''}`);
      ctx.stdout('Available commands:\n' + lines.join('\n'));
      return;
    }
    const name = args[0].replace(/^\//, '');
    const cmd = registry.get(name);
    if (!cmd) {
      ctx.stdout(`No help available: unknown command /${name}`);
      return;
    }
    ctx.stdout(`/${cmd.name} - ${cmd.description || ''}`);
  },
};

export default helpCommand;
