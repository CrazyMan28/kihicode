"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const registry_1 = require("../commands/registry");
(0, vitest_1.describe)('CommandRegistry', () => {
    (0, vitest_1.it)('registers and executes a command', async () => {
        const registry = new registry_1.CommandRegistry();
        const results = [];
        const cmd = {
            name: 'testcmd',
            description: 'a test command',
            async execute(ctx, args) {
                results.push({ ctxSent: ctx.marker, args });
            }
        };
        registry.register(cmd);
        const ctx = { stdout: () => { }, exit: () => { }, marker: 'ok', registry };
        await registry.execute('/testcmd one two', ctx);
        (0, vitest_1.expect)(results.length).toBe(1);
        (0, vitest_1.expect)(results[0].args).toEqual(['one', 'two']);
        (0, vitest_1.expect)(results[0].ctxSent).toBe('ok');
    });
});
