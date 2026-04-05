import { Command } from '../Command';
import MemoryStore from '../../memory/store';

const memory = new MemoryStore();

const memoryCommand: Command = {
  name: 'memory',
  description: 'List memory notes (usage: /memory)',
  async execute(ctx) {
    const list = await memory.list();
    if (!list.length) {
      ctx.stdout('No memory items. Use /remember to add one.');
      return;
    }
    const lines = list.map((i: any) => `${i.id} - ${i.text}`);
    ctx.stdout(lines.join('\n'));
  },
};

export default memoryCommand;
