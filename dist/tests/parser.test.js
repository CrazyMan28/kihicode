"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const parser_1 = require("../commands/parser");
(0, vitest_1.describe)('parseSlash', () => {
    (0, vitest_1.it)('parses simple command without args', () => {
        const res = (0, parser_1.parseSlash)('/help');
        (0, vitest_1.expect)(res.name).toBe('help');
        (0, vitest_1.expect)(res.args).toEqual([]);
    });
    (0, vitest_1.it)('parses flags and values', () => {
        const res = (0, parser_1.parseSlash)('/login --provider openai --key sk-abc123');
        (0, vitest_1.expect)(res.name).toBe('login');
        (0, vitest_1.expect)(res.args).toEqual(['--provider', 'openai', '--key', 'sk-abc123']);
    });
    (0, vitest_1.it)('parses quoted arguments', () => {
        const res = (0, parser_1.parseSlash)('/echo "hello world" \"inner\"');
        (0, vitest_1.expect)(res.name).toBe('echo');
        (0, vitest_1.expect)(res.args[0]).toBe('hello world');
    });
});
