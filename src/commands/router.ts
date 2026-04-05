import { AgentStore } from '../store/agentStore.js';
import { AgentLoop } from '../agent/loop.js';
import { AuthStore } from '../config/auth.js';
import { execa } from 'execa';

const PROVIDERS = ['openai', 'anthropic', 'mistral', 'huggingface'];
const MODELS: Record<string, string[]> = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229'],
    mistral: ['mistral-large-latest', 'mistral-small-latest'],
    huggingface: ['meta-llama/Llama-3-70b-chat']
};

export const CommandRouter = {
  async execute(cmd: string, store: AgentStore) {
    const trimmed = cmd.trim();
    const [name, ...args] = trimmed.split(' ');
    const command = name.slice(1).toLowerCase(); // remove /

    switch (command) {
      case 'login':
        store.openSelection('login', PROVIDERS, (provider) => {
            store.closeSelection();
            store.addMessage('system', `SELECTED PROVIDER: ${provider.toUpperCase()}`);
            // This will trigger the secret input in App.tsx
            (store as any)._triggerSecretInput(provider); 
        });
        break;

      case 'model':
        const allAvailableModels = store.loggedInProviders.flatMap(p => MODELS[p] || []);
        if (allAvailableModels.length === 0) {
            store.addMessage('agent', 'No active providers. Please /login first.');
            return;
        }
        store.openSelection('model', allAvailableModels, (model) => {
            store.closeSelection();
            store.setActiveModel(model);
            store.addMessage('system', `ACTIVE MODEL SET TO: ${model}`);
        });
        break;

      case 'session':
        if (args[0] === 'list') {
            store.openSelection('session', store.sessions, (session) => {
                store.closeSelection();
                store.addMessage('system', `SWITCHED TO SESSION: ${session}`);
            });
        }
        break;

      case 'website':
        if (args[0] === 'on') {
          store.setIsWebsiteOn(true);
          store.addMessage('system', 'Website: Starting local network monitor...');
        } else if (args[0] === 'off') {
          store.setIsWebsiteOn(false);
          store.addMessage('system', 'Website: Stopping local network monitor...');
        } else {
          store.addMessage('agent', 'Usage: /website on | off');
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
      case 'help':
        store.addMessage('system', 'Commands: /plan, /build, /autopilot, /clear, /website on/off, /session list, /login, /model, /auth, /help');
        break;
      default:
        store.addMessage('system', `Unknown command: ${command}`);
    }
  }
};
