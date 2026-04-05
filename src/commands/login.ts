import inquirer from 'inquirer';
import { Command } from './Command.js';
import AuthStore from '../auth/store.js';
import { validateProviderKey } from '../auth/providers.js';

function parseFlags(args: string[]): Record<string, string> {
  const flags: Record<string, string> = {};
  let i = 0;
  while (i < args.length) {
    const a = args[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = args[i+1] && !args[i+1].startsWith('--') ? args[i+1] : 'true';
      flags[key] = val;
      if (val !== 'true') i += 2; else i += 1;
    } else {
      i += 1;
    }
  }
  return flags;
}

const loginCommand: Command = {
  name: 'login',
  description: 'Login to an AI provider (flags: --provider <name> --key <apiKey>)',
  async execute(ctx, args) {
    const flags = parseFlags(args || []);
    let provider = flags['provider'];
    let key = flags['key'];
    if (!provider) {
      const res = await inquirer.prompt([{ type: 'list', name: 'provider', message: 'Select provider', choices: ['openai', 'anthropic', 'huggingface'] }]);
      provider = res.provider;
    }
    if (!key) {
      const res = await inquirer.prompt([{ type: 'password', name: 'key', message: `Enter API key for ${provider}` }]);
      key = res.key;
    }
    const store = new AuthStore();
    const ok = await validateProviderKey(provider, key);
    if (!ok) {
      const res = await inquirer.prompt([{ type: 'confirm', name: 'save', message: `Validation failed or skipped for ${provider}. Save anyway?`, default: false }]);
      if (!res.save) {
        ctx.stdout('Aborted saving credentials.');
        return;
      }
    }
    await store.saveCredentials(provider, key);
    ctx.stdout(`Saved credentials for provider: ${provider}`);
  },
};

export default loginCommand;
