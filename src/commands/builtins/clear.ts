import { Command } from '../Command.js';

const clearCommand: Command = {
  name: 'clear',
  description: 'Clear the screen',
  execute() {
    process.stdout.write('\x1Bc');
  },
};

export default clearCommand;
