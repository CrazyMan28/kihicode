import readline from 'readline';
import { registry, initCommands } from './commands';
import { subagentManager } from './subagent/manager';
import AuthStore from './auth/store';


// initialize commands (builtins + custom)
initCommands().catch(() => {});

const authStore = new AuthStore();

const ctx = {
  stdout: (msg: string) => console.log(msg),
  exit: (code?: number) => process.exit(code ?? 0),
  registry,
  subagentManager,
  authStore,
};

// custom commands are loaded by initCommands()

function printHeader() {
  console.clear();
  const title = 'Kihicode — Agentic AI';
  const ver = 'v1.0.0';
  const cols = 78;
  const pad = (s: string) => s + ' '.repeat(Math.max(0, cols - s.length));
  console.log('┌' + '─'.repeat(cols) + '┐');
  console.log('│' + pad(`${title} ${ver}`) + '│');
  console.log('│' + pad('Type /help for commands — press Tab for completions — type / to open palette') + '│');
  console.log('└' + '─'.repeat(cols) + '┘\n');
}

const completer = (line: string) => {
  if (!line.startsWith('/')) return [[], line];
  const q = line.slice(1).toLowerCase();
  const cmds = registry.list().map((c: any) => '/' + c.name);
  const hits = cmds.filter((c: string) => c.toLowerCase().startsWith('/' + q));
  return [hits.length ? hits : cmds, line];
};

const rl = readline.createInterface({ input: process.stdin, output: process.stdout, completer, terminal: true });
rl.setPrompt('kihicode> ');

function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, ans => resolve(ans)));
}

async function showCommandPalette() {
  const cmds = registry.list();
  console.log('\nCommand Palette:');
  cmds.forEach((c: any, i: number) => {
    console.log(`${i + 1}. /${c.name} - ${c.description || ''}`);
  });
  const ans = (await askQuestion('\nSelect number (q to cancel): ')).trim();
  if (ans.toLowerCase() === 'q' || ans === '') { rl.prompt(); return; }
  const idx = Number.parseInt(ans, 10);
  if (!Number.isNaN(idx) && idx >= 1 && idx <= cmds.length) {
    const cmd = cmds[idx - 1];
    await registry.execute('/' + cmd.name, ctx);
  } else {
    console.log('Invalid selection');
  }
  rl.prompt();
}

printHeader();

rl.prompt();

rl.on('line', async (line: string) => {
  const trimmed = line.trim();
  if (trimmed === '') { rl.prompt(); return; }
  if (trimmed === '/') {
    await showCommandPalette();
    return;
  }
  if (trimmed.startsWith('/')) {
    await registry.execute(trimmed, ctx);
  } else {
    console.log('>', trimmed);
  }
  rl.prompt();
}).on('close', () => {
  console.log('Bye!');
  process.exit(0);
});
