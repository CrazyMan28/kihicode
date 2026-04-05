import { parseSlash } from './parser.js';
export class CommandRegistry {
    commands = new Map();
    register(cmd) {
        if (!cmd || !cmd.name)
            throw new Error('Invalid command');
        this.commands.set(cmd.name, cmd);
    }
    list() {
        return Array.from(this.commands.values());
    }
    get(name) {
        return this.commands.get(name);
    }
    async execute(rawInput, ctx) {
        try {
            const { name, args } = parseSlash(rawInput);
            if (!name) {
                ctx.stdout('No command provided.');
                return;
            }
            const cmd = this.get(name);
            if (!cmd) {
                ctx.stdout(`Unknown command: /${name}`);
                return;
            }
            await cmd.execute(ctx, args);
        }
        catch (err) {
            ctx.stdout('Error executing command: ' + (err?.message ?? String(err)));
        }
    }
}
//# sourceMappingURL=registry.js.map