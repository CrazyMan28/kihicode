import { z } from 'zod';
import * as fs from 'node:fs/promises';
import { registry } from '../registry.js';
export function registerFsTools() {
    registry.register({
        name: 'readFile',
        description: 'Reads the content of a file.',
        schema: z.object({
            path: z.string().describe('The path to the file to read.')
        }),
        sensitive: false,
        execute: async (args) => {
            return await fs.readFile(args.path, 'utf8');
        }
    });
    registry.register({
        name: 'writeFile',
        description: 'Writes content to a file.',
        schema: z.object({
            path: z.string().describe('The path to the file to write to.'),
            content: z.string().describe('The content to write.')
        }),
        sensitive: true,
        execute: async (args) => {
            await fs.writeFile(args.path, args.content, 'utf8');
            return `File ${args.path} written successfully.`;
        }
    });
    registry.register({
        name: 'listDir',
        description: 'Lists the contents of a directory.',
        schema: z.object({
            path: z.string().describe('The path to the directory to list.')
        }),
        sensitive: false,
        execute: async (args) => {
            const files = await fs.readdir(args.path);
            return files.join('\n');
        }
    });
}
//# sourceMappingURL=fs.js.map