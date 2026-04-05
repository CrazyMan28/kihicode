"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = __importDefault(require("../../memory/store"));
const memory = new store_1.default();
const memoryCommand = {
    name: 'memory',
    description: 'List memory notes (usage: /memory)',
    async execute(ctx) {
        const list = await memory.list();
        if (!list.length) {
            ctx.stdout('No memory items. Use /remember to add one.');
            return;
        }
        const lines = list.map((i) => `${i.id} - ${i.text}`);
        ctx.stdout(lines.join('\n'));
    },
};
exports.default = memoryCommand;
