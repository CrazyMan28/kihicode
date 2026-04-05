"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const indexer_1 = __importDefault(require("../../context/indexer"));
const indexer = new indexer_1.default();
const contextCommand = {
    name: 'context',
    description: 'Show indexed context directories and files',
    async execute(ctx, args) {
        const dirs = await indexer.listDirs();
        if (dirs.length === 0) {
            ctx.stdout('No directories indexed. Use /add-dir to add one.');
            return;
        }
        const parts = [];
        for (const d of dirs) {
            parts.push(d);
            if (args && args[0] === 'files') {
                const files = await indexer.listFiles(d);
                if (files.length)
                    parts.push('  ' + files.join('\n  '));
            }
        }
        ctx.stdout(parts.join('\n'));
    },
};
exports.default = contextCommand;
