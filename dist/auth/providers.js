"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProviderKey = validateProviderKey;
const openai_1 = __importDefault(require("./adapters/openai"));
const anthropic_1 = __importDefault(require("./adapters/anthropic"));
const huggingface_1 = __importDefault(require("./adapters/huggingface"));
async function validateProviderKey(provider, apiKey) {
    if (!apiKey || apiKey.length < 8)
        return false;
    try {
        if (provider === 'openai')
            return await (0, openai_1.default)(apiKey);
        if (provider === 'anthropic')
            return await (0, anthropic_1.default)(apiKey);
        if (provider === 'huggingface')
            return await (0, huggingface_1.default)(apiKey);
    }
    catch (err) {
        return false;
    }
    // fallback heuristic
    return apiKey.length > 20;
}
exports.default = { validateProviderKey };
