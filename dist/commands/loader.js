import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
export async function loadCustomCommands(registry, baseDir) {
    const dir = baseDir ?? path.join(process.cwd(), '.kihicode', 'commands');
    try {
        const exists = fs.existsSync(dir);
        if (!exists)
            return;
        const files = await fs.promises.readdir(dir);
        for (const f of files) {
            if (!f.endsWith('.js') && !f.endsWith('.ts'))
                continue;
            try {
                const mod = await import(pathToFileURL(path.join(dir, f)).href);
                const cmd = mod?.default;
                if (cmd && cmd.name && typeof cmd.execute === 'function') {
                    registry.register(cmd);
                }
            }
            catch (err) {
                // ignore faulty custom commands
            }
        }
    }
    catch (err) {
        // ignore
    }
}
export default { loadCustomCommands };
//# sourceMappingURL=loader.js.map