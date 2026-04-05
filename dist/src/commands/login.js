"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const store_1 = __importDefault(require("../auth/store"));
const providers_1 = require("../auth/providers");
function parseFlags(args) {
    const flags = {};
    let i = 0;
    while (i < args.length) {
        const a = args[i];
        if (a.startsWith('--')) {
            const key = a.slice(2);
            const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : 'true';
            flags[key] = val;
            if (val !== 'true')
                i += 2;
            else
                i += 1;
        }
        else {
            i += 1;
        }
    }
    return flags;
}
const loginCommand = {
    name: 'login',
    description: 'Login to an AI provider (flags: --provider <name> --key <apiKey>)',
    async execute(ctx, args) {
        const flags = parseFlags(args || []);
        let provider = flags['provider'];
        let key = flags['key'];
        if (!provider) {
            const res = await inquirer_1.default.prompt([{ type: 'list', name: 'provider', message: 'Select provider', choices: ['openai', 'anthropic', 'huggingface'] }]);
            provider = res.provider;
        }
        if (!key) {
            const res = await inquirer_1.default.prompt([{ type: 'password', name: 'key', message: `Enter API key for ${provider}` }]);
            key = res.key;
        }
        const store = new store_1.default();
        const ok = await (0, providers_1.validateProviderKey)(provider, key);
        if (!ok) {
            const res = await inquirer_1.default.prompt([{ type: 'confirm', name: 'save', message: `Validation failed or skipped for ${provider}. Save anyway?`, default: false }]);
            if (!res.save) {
                ctx.stdout('Aborted saving credentials.');
                return;
            }
        }
        await store.saveCredentials(provider, key);
        ctx.stdout(`Saved credentials for provider: ${provider}`);
    },
};
exports.default = loginCommand;
