import { z } from 'zod';
import { execa } from 'execa';
import { registry } from '../registry.js';
export function registerShellTools() {
    registry.register({
        name: 'executeCommand',
        description: 'Executes a shell command.',
        schema: z.object({
            command: z.string().describe('The command to execute.'),
            args: z.array(z.string()).optional().describe('Optional arguments for the command.')
        }),
        sensitive: true,
        execute: async (args) => {
            try {
                const { stdout, stderr } = await execa(args.command, args.args || [], { shell: true });
                return stdout || stderr;
            }
            catch (error) {
                return `Error: ${error.message}\n${error.stderr}`;
            }
        }
    });
}
//# sourceMappingURL=shell.js.map