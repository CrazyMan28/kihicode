"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnthropicAdapter = void 0;
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class AnthropicAdapter {
    constructor(apiKey) {
        this.client = new sdk_1.default({ apiKey });
    }
    async create(messages, tools) {
        return await this.client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            messages,
            tools: tools || [],
            max_tokens: 4096
        });
    }
}
exports.AnthropicAdapter = AnthropicAdapter;
