import Anthropic from '@anthropic-ai/sdk';

export interface LLMAdapter {
  create(messages: any[], tools?: any[]): Promise<any>;
}

export class AnthropicAdapter implements LLMAdapter {
  private client: any;
  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey });
  }

  async create(messages: any[], tools?: any[]) {
    return await this.client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      messages,
      tools: tools || [],
      max_tokens: 4096
    });
  }
}
