"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline_1 = __importDefault(require("readline"));
const commands_1 = require("./commands");
const manager_1 = require("./subagent/manager");
const store_1 = __importDefault(require("./auth/store"));
// initialize commands (builtins + custom)
(0, commands_1.initCommands)().catch(() => { });
const authStore = new store_1.default();
const ctx = {
    stdout: (msg) => console.log(msg),
    exit: (code) => process.exit(code ?? 0),
    registry: commands_1.registry,
    subagentManager: manager_1.subagentManager,
    authStore,
};
// custom commands are loaded by initCommands()
function printHeader() {
    console.clear();
    const title = 'Kihicode — Agentic AI';
    const ver = 'v1.0.0';
    const cols = 78;
    const pad = (s) => s + ' '.repeat(Math.max(0, cols - s.length));
    console.log('┌' + '─'.repeat(cols) + '┐');
    console.log('│' + pad(`${title} ${ver}`) + '│');
    console.log('│' + pad('Type /help for commands — press Tab for completions — type / to open palette') + '│');
    console.log('└' + '─'.repeat(cols) + '┘\n');
}
const completer = (line) => {
    if (!line.startsWith('/'))
        return [[], line];
    const q = line.slice(1).toLowerCase();
    const cmds = commands_1.registry.list().map((c) => '/' + c.name);
    const hits = cmds.filter((c) => c.toLowerCase().startsWith('/' + q));
    return [hits.length ? hits : cmds, line];
};
const rl = readline_1.default.createInterface({ input: process.stdin, output: process.stdout, completer, terminal: true });
rl.setPrompt('kihicode> ');
function askQuestion(query) {
    return new Promise(resolve => rl.question(query, ans => resolve(ans)));
}
async function showCommandPalette() {
    const cmds = commands_1.registry.list();
    console.log('\nCommand Palette:');
    cmds.forEach((c, i) => {
        console.log(`${i + 1}. /${c.name} - ${c.description || ''}`);
    });
    const ans = (await askQuestion('\nSelect number (q to cancel): ')).trim();
    if (ans.toLowerCase() === 'q' || ans === '') {
        rl.prompt();
        return;
    }
    const idx = Number.parseInt(ans, 10);
    if (!Number.isNaN(idx) && idx >= 1 && idx <= cmds.length) {
        const cmd = cmds[idx - 1];
        await commands_1.registry.execute('/' + cmd.name, ctx);
    }
    else {
        console.log('Invalid selection');
    }
    rl.prompt();
}
printHeader();
rl.prompt();
rl.on('line', async (line) => {
    const trimmed = line.trim();
    if (trimmed === '') {
        rl.prompt();
        return;
    }
    if (trimmed === '/') {
        await showCommandPalette();
        return;
    }
    if (trimmed.startsWith('/')) {
        await commands_1.registry.execute(trimmed, ctx);
    }
    else {
        console.log('>', trimmed);
    }
    rl.prompt();
}).on('close', () => {
    console.log('Bye!');
    process.exit(0);
});
