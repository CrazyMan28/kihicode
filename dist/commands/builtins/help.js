"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpCommand = {
    name: 'help',
    description: 'Show available commands or details for a command',
    execute(ctx, args) {
        const registry = ctx.registry;
        if (!args || args.length === 0) {
            const list = registry.list();
            const lines = list.map((c) => `/${c.name} - ${c.description || ''}`);
            ctx.stdout('Available commands:\n' + lines.join('\n'));
            return;
        }
        const name = args[0].replace(/^\//, '');
        const cmd = registry.get(name);
        if (!cmd) {
            ctx.stdout(`No help available: unknown command /${name}`);
            return;
        }
        ctx.stdout(`/${cmd.name} - ${cmd.description || ''}`);
    },
};
exports.default = helpCommand;
