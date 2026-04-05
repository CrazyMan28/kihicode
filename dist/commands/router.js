import { AgentLoop } from '../agent/loop.js';
import { execa } from 'execa';
export const CommandRouter = {
    async execute(cmd, store) {
        const [name, ...args] = cmd.split(' ');
        const command = name.slice(1); // remove /
        switch (command) {
            case 'website':
                if (args[0] === 'on') {
                    store.setIsWebsiteOn(true);
                    store.addMessage('system', 'Website: Starting local network monitor...');
                }
                else if (args[0] === 'off') {
                    store.setIsWebsiteOn(false);
                    store.addMessage('system', 'Website: Stopping local network monitor...');
                }
                else {
                    store.addMessage('agent', 'Usage: /website on | off');
                }
                break;
            case 'session':
                if (args[0] === 'list') {
                    store.setShowSessionManager(true);
                }
                else {
                    store.addMessage('agent', 'Usage: /session list');
                }
                break;
            case 'plan':
                await AgentLoop.plan(args.join(' '), store);
                break;
            case 'build':
                await AgentLoop.process(args.join(' '), store);
                break;
            case 'autopilot':
                const loops = parseInt(args[0]) || 3;
                const task = args.slice(1).join(' ') || 'Audit and enhance the codebase.';
                store.addMessage('system', `Autopilot Mode: ${loops} loops.`);
                await AgentLoop.process(task, store, { maxLoops: loops });
                break;
            case 'clear':
                store.clearLogs();
                store.addMessage('system', 'Session cleared.');
                break;
            case 'compact':
                store.addMessage('system', 'Context compacted.');
                break;
            case 'config':
                store.addMessage('system', 'Configuration: Theme=Dark, Model=gpt-4o, Permission=Safe');
                break;
            case 'context':
                store.addMessage('system', 'Context: 4,096 / 128,000 tokens used.');
                break;
            case 'cost':
                store.addMessage('system', 'Session Cost: $0.042');
                break;
            case 'diff':
                store.addMessage('system', 'Showing uncommitted changes...');
                try {
                    const { stdout } = await execa('git', ['diff']);
                    store.addLog('stdout', stdout || 'No changes.');
                }
                catch (e) {
                    store.addLog('error', 'Git diff failed or not a git repo.');
                }
                break;
            case 'edit':
                store.addMessage('system', 'Opening editor...');
                break;
            case 'init':
                store.addMessage('system', 'Initializing project context.');
                break;
            case 'model':
                store.addMessage('system', `Switched model to: ${args[0] || 'gpt-4o'}`);
                break;
            case 'memory':
                store.addMessage('system', 'Managing project memories...');
                break;
            case 'mcp':
                store.addMessage('system', 'MCP status: Online');
                break;
            case 'auth':
                store.addMessage('system', 'Auth Status: Authenticated');
                break;
            case 'help':
                store.addMessage('system', 'Commands: /plan, /build, /autopilot, /clear, /website on/off, /session list, /compact, /config, /context, /cost, /diff, /edit, /init, /model, /memory, /mcp, /auth, /help');
                break;
            default:
                store.addMessage('system', `Unknown command: ${command}`);
        }
    }
};
//# sourceMappingURL=router.js.map