export interface LLMAdapter {
    create(messages: any[], tools?: any[]): Promise<any>;
}
export declare class AnthropicAdapter implements LLMAdapter {
    private client;
    constructor(apiKey: string);
    create(messages: any[], tools?: any[]): Promise<any>;
}
