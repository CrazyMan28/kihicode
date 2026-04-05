"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandRegistry = void 0;
const parser_1 = require("./parser");
class CommandRegistry {
    constructor() {
        this.commands = new Map();
    }
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
            const { name, args } = (0, parser_1.parseSlash)(rawInput);
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
exports.CommandRegistry = CommandRegistry;
