import Anthropic from '@anthropic-ai/sdk';
export class AnthropicAdapter {
    client;
    constructor(apiKey) {
        this.client = new Anthropic({ apiKey });
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
//# sourceMappingURL=llm.js.map