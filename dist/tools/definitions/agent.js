import { z } from 'zod';
import { registry } from '../registry.js';
import { subagentManager } from '../../subagent/manager.js';
export function registerAgentTools() {
    registry.register({
        name: 'invokeSubagent',
        description: 'Invoke a named subagent (runs as a background job).',
        schema: z.object({
            agent: z.string().describe('The agent module name under src/subagent/agents (no extension).'),
            args: z.any().optional().describe('Arguments to pass to the agent')
        }),
        sensitive: false,
        execute: async (args) => {
            if (!args || !args.agent)
                return 'Error: missing `agent` parameter.';
            const agentName = args.agent;
            try {
                const mod = await import(`../../subagent/agents/${agentName}.js`);
                const runFn = mod.run || mod.default;
                if (!runFn)
                    return `Agent '${agentName}' does not export a 'run' function.`;
                const id = subagentManager.start(async () => {
                    return await runFn(args.args ?? args);
                });
                return `Started subagent job: ${id}`;
            }
            catch (err) {
                return `Failed to invoke agent '${agentName}': ${err?.message ?? String(err)}`;
            }
        }
    });
}
//# sourceMappingURL=agent.js.map