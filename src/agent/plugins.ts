import fs from 'fs-extra';
import path from 'path';
import { tool } from 'ai';
import { z } from 'zod';

export const PluginLoader = {
  async loadPlugins() {
    const pluginsDir = path.resolve('./src/plugins');
    await fs.ensureDir(pluginsDir);
    const files = await fs.readdir(pluginsDir);
    const plugins: Record<string, any> = {};

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const pluginPath = path.join(pluginsDir, file);
        // In 2026 TS/Bun/Deno, we can import TS directly
        const plugin = await import(`file://${pluginPath}`);
        if (plugin.default) {
          plugins[plugin.default.name] = tool({
            description: plugin.default.description,
            parameters: plugin.default.parameters,
            execute: plugin.default.execute
          });
        }
      }
    }
    return plugins;
  },

  async createPlugin(name: string, description: string, code: string) {
    const pluginsDir = path.resolve('./src/plugins');
    const filePath = path.join(pluginsDir, `${name}.ts`);
    const content = `
import { z } from 'zod';

export default {
  name: "${name}",
  description: "${description}",
  parameters: z.object({}), // AI can modify this
  execute: async (params: any) => {
    ${code}
  }
};
`;
    await fs.writeFile(filePath, content, 'utf-8');
    return filePath;
  }
};
