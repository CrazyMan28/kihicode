"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const store_1 = __importDefault(require("../../memory/store"));
const memory = new store_1.default();
const rememberCommand = {
    name: 'remember',
    description: 'Save a small note to memory',
    async execute(ctx, args) {
        let text = args && args.length ? args.join(' ') : undefined;
        if (!text) {
            const res = await inquirer_1.default.prompt([{ type: 'input', name: 'text', message: 'Text to remember' }]);
            text = res.text;
        }
        if (!text) {
            ctx.stdout('No text provided.');
            return;
        }
        const item = await memory.remember(text);
        ctx.stdout(`Remembered (${item.id}): ${item.text}`);
    },
};
exports.default = rememberCommand;
