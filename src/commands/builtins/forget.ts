import { Command } from '../Command.js';
import MemoryStore from '../../memory/store.js';

const memory = new MemoryStore();

const forgetCommand: Command = {
  name: 'forget',
  description: 'Forget a memory item by id (usage: /forget <id>)',
  async execute(ctx, args) {
    const id = args && args.length ? args[0] : undefined;
    if (!id) {
      ctx.stdout('Usage: /forget <id>');
      return;
    }
    const ok = await memory.forget(id);
    ctx.stdout(ok ? `Forgot ${id}` : `Failed to forget ${id}`);
  },
};

export default forgetCommand;
