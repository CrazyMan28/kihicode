import { z } from 'zod';
import * as fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import { registry } from '../registry.js';
// Store plugins in the user's home directory under ~/.kihicode/plugins
const PLUGINS_DIR = path.join(os.homedir(), '.kihicode', 'plugins');
export async function registerDynamicTools() {
    await fs.mkdir(PLUGINS_DIR, { recursive: true });
    registry.register({
        name: 'createTool',
        description: 'Creates a new tool and adds it to the registry.',
        schema: z.object({
            name: z.string().describe('The name of the tool.'),
            description: z.string().describe('The description of the tool.'),
            code: z.string().describe('The TypeScript code for the tool execution function.')
        }),
        sensitive: true,
        execute: async (args) => {
            const fileName = `${args.name}.ts`;
            const filePath = path.join(PLUGINS_DIR, fileName);
            const toolCode = `import { z } from 'zod';
export const name = ${JSON.stringify(args.name)};
export const description = ${JSON.stringify(args.description)};
export const schema = z.object({});
export const sensitive = true;
export const execute = async (args: any) => {
${args.code}
};`;
            await fs.writeFile(filePath, toolCode, 'utf8');
            // Try to dynamically import and register the new tool immediately.
            try {
                const moduleUrl = pathToFileURL(filePath).href;
                const mod = await import(moduleUrl);
                const toolSchema = mod.schema || z.object({});
                const tool = {
                    name: mod.name || args.name,
                    description: mod.description || args.description || '',
                    schema: toolSchema,
                    sensitive: !!mod.sensitive,
                    execute: mod.execute
                };
                registry.register(tool);
                return `Tool ${tool.name} created and registered from ${filePath}.`;
            }
            catch (err) {
                return `Tool ${args.name} saved to ${filePath}, but hot-reload failed: ${err?.message || err}. Restart Kihicode to load it.`;
            }
        }
    });
}
//# sourceMappingURL=dynamic.js.map