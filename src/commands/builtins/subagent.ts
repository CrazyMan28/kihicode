import { Command } from '../Command.js';

const subagentCommand: Command = {
  name: 'subagent',
  description: 'Manage background subagents: start/list/status',
  async execute(ctx, args) {
    const verb = args && args.length ? args[0] : 'list';
    if (verb === 'start') {
      const id = ctx.subagentManager.start(async () => {
        // Example background task: wait and return a small message
        await new Promise(r => setTimeout(r, 3000));
        return { message: 'subagent task complete' };
      });
      ctx.stdout(`Started subagent job: ${id}`);
      return;
    }
    if (verb === 'list') {
      const jobs = ctx.subagentManager.list();
      if (!jobs.length) { ctx.stdout('No subagent jobs'); return; }
      const lines = jobs.map((j: any) => `${j.id} - ${j.status}`);
      ctx.stdout(lines.join('\n'));
      return;
    }
    if (verb === 'status') {
      const id = args[1];
      if (!id) { ctx.stdout('Usage: /subagent status <id>'); return; }
      const s = ctx.subagentManager.status(id);
      ctx.stdout(`${id} - ${s}`);
      return;
    }
    ctx.stdout('Usage: /subagent start|list|status <id>');
  },
};

export default subagentCommand;
