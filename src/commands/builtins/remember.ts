import inquirer from 'inquirer';
import { Command } from '../Command.js';
import MemoryStore from '../../memory/store.js';

const memory = new MemoryStore();

const rememberCommand: Command = {
  name: 'remember',
  description: 'Save a small note to memory',
  async execute(ctx, args) {
    let text = args && args.length ? args.join(' ') : undefined;
    if (!text) {
      const res = await inquirer.prompt([{ type: 'input', name: 'text', message: 'Text to remember' }]);
      text = res.text as string | undefined;
    }
    if (!text) {
      ctx.stdout('No text provided.');
      return;
    }
    const item = await memory.remember(text);
    ctx.stdout(`Remembered (${item.id}): ${item.text}`);
  },
};

export default rememberCommand;
