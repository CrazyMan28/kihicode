"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const store_1 = __importDefault(require("../../memory/store"));
const memory = new store_1.default();
const forgetCommand = {
    name: 'forget',
    description: 'Forget a memory item by id (usage: /forget <id>)',
    async execute(ctx, args) {
        const id = args && args.length ? args[0] : undefined;
        if (!id) {
            ctx.stdout('Usage: /forget <id>');
            return;
        }
        const ok = await memory.forget(id);
        ctx.stdout(ok ? `Forgot ${id}` : `Failed to forget ${id}`);
    },
};
exports.default = forgetCommand;
