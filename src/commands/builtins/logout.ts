import inquirer from 'inquirer';
import { Command } from '../Command';

const logoutCommand: Command = {
  name: 'logout',
  description: 'Remove stored credentials for a provider',
  async execute(ctx, args) {
    let provider = args && args.length ? args[0] : undefined;
    if (!provider) {
      const res = await inquirer.prompt([{ type: 'input', name: 'provider', message: 'Provider to logout (e.g. openai)' }]);
      provider = res.provider;
    }
    try {
      await ctx.authStore.deleteCredentials(provider);
      ctx.stdout(`Removed credentials for ${provider}`);
    } catch (err: any) {
      ctx.stdout(`Failed to remove credentials: ${err?.message ?? String(err)}`);
    }
  },
};

export default logoutCommand;
