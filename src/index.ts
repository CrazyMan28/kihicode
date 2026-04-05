import React from 'react';
import { render } from 'ink';
import { KihicodeApp } from './tui/App.js';
import { parseArguments } from './cli/args.js';

async function main() {
  const args = parseArguments();
  
  // Clear terminal for a professional start
  process.stdout.write('\u001b[2J\u001b[0;0H');

  const { waitUntilExit } = render(
    React.createElement(KihicodeApp, { initialCommand: args.command })
  );

  await waitUntilExit();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
