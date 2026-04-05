"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const logoutCommand = {
    name: 'logout',
    description: 'Remove stored credentials for a provider',
    async execute(ctx, args) {
        let provider = args && args.length ? args[0] : undefined;
        if (!provider) {
            const res = await inquirer_1.default.prompt([{ type: 'input', name: 'provider', message: 'Provider to logout (e.g. openai)' }]);
            provider = res.provider;
        }
        try {
            await ctx.authStore.deleteCredentials(provider);
            ctx.stdout(`Removed credentials for ${provider}`);
        }
        catch (err) {
            ctx.stdout(`Failed to remove credentials: ${err?.message ?? String(err)}`);
        }
    },
};
exports.default = logoutCommand;
