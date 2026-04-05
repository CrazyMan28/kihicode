import { Command } from '../Command';

const statusCommand: Command = {
  name: 'status',
  description: 'Show session status and providers',
  async execute(ctx) {
    const providers = await ctx.authStore?.listProviders?.() ?? [];
    const jobs = ctx.subagentManager?.list?.() ?? [];
    const cmdCount = ctx.registry?.list?.()?.length ?? 0;
    ctx.stdout(`Commands: ${cmdCount}\nProviders: ${providers.length ? providers.join(', ') : 'none'}\nSubagents: ${jobs.length} jobs`);
  },
};

export default statusCommand;
