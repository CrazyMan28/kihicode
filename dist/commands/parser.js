"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSlash = parseSlash;
function parseSlash(input) {
    const trimmed = input.trim();
    if (!trimmed.startsWith('/'))
        throw new Error('Not a slash command');
    const raw = trimmed.slice(1);
    const tokenRegex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    const tokens = [];
    let m;
    while ((m = tokenRegex.exec(raw)) !== null) {
        tokens.push(m[1] ?? m[2] ?? m[0]);
    }
    return { name: tokens[0] ?? '', args: tokens.slice(1) };
}
