import { Command } from '../Command';
import Indexer from '../../context/indexer';

const indexer = new Indexer();

const contextCommand: Command = {
  name: 'context',
  description: 'Show indexed context directories and files',
  async execute(ctx, args) {
    const dirs = await indexer.listDirs();
    if (dirs.length === 0) {
      ctx.stdout('No directories indexed. Use /add-dir to add one.');
      return;
    }
    const parts: string[] = [];
    for (const d of dirs) {
      parts.push(d);
      if (args && args[0] === 'files') {
        const files = await indexer.listFiles(d);
        if (files.length) parts.push('  ' + files.join('\n  '));
      }
    }
    ctx.stdout(parts.join('\n'));
  },
};

export default contextCommand;
