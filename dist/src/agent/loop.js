"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentLoop = void 0;
let Anthropic = null;
try {
    // require the SDK only if available; this keeps the project runnable without the dependency
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('@anthropic-ai/sdk');
    Anthropic = mod && (mod.default || mod);
}
catch (e) {
    Anthropic = null;
}
const registry_1 = require("../tools/registry");
class AgentLoop {
    constructor(apiKey) {
        this.isStub = false;
        this.messageHistory = [];
        this.mode = 'safe';
        // pending approvals map: tool_use_id -> {resolve, reject}
        this.pendingApprovals = new Map();
        if (apiKey) {
            this.setApiKey(apiKey);
        }
        else {
            this.isStub = true;
            this.client = null;
        }
    }
    setApiKey(key) {
        this.apiKey = key;
        try {
            this.client = new Anthropic({ apiKey: key });
            this.isStub = false;
        }
        catch (err) {
            // fallback to stub
            this.isStub = true;
            this.client = null;
        }
    }
    setMode(mode) {
        this.mode = mode;
    }
    // Called by UI to respond to a pending approval request
    respondToApproval(toolUseId, approved, editedArgs) {
        const pending = this.pendingApprovals.get(toolUseId);
        if (!pending)
            return false;
        pending.resolve({ approved, args: editedArgs });
        this.pendingApprovals.delete(toolUseId);
        return true;
    }
    async run(userInput, onUpdate) {
        this.messageHistory.push({ role: 'user', content: userInput });
        let isRunning = true;
        while (isRunning) {
            onUpdate({ status: 'thinking' });
            try {
                let response;
                if (this.isStub || !this.client) {
                    // simple local stub: echo and helpful hint
                    const lastUser = this.messageHistory.slice().reverse().find((m) => m.role === 'user');
                    const lastText = lastUser ? (typeof lastUser.content === 'string' ? lastUser.content : JSON.stringify(lastUser.content)) : '';
                    response = {
                        content: [
                            { type: 'text', text: `No LLM configured. To enable full AI features set ANTHROPIC_API_KEY in your .env or run '/auth <key>'.\n\nStub reply (echo): ${lastText}` }
                        ]
                    };
                }
                else {
                    response = await this.client.messages.create({
                        model: 'claude-3-5-sonnet-20241022',
                        max_tokens: 4096,
                        messages: this.messageHistory,
                        tools: registry_1.registry.getAllTools().map(t => ({
                            name: t.name,
                            description: t.description,
                            input_schema: {
                                type: 'object',
                                properties: t.schema.shape,
                            }
                        }))
                    });
                }
                const textBlock = response.content.find((c) => c.type === 'text');
                const toolCalls = response.content.filter((c) => c.type === 'tool_use');
                if (textBlock) {
                    onUpdate({ status: 'message', content: textBlock.text });
                    this.messageHistory.push({ role: 'assistant', content: response.content });
                    isRunning = false;
                }
                if (toolCalls.length > 0) {
                    if (!textBlock) {
                        this.messageHistory.push({ role: 'assistant', content: response.content });
                    }
                    for (const toolCall of toolCalls) {
                        const tool = registry_1.registry.getTool(toolCall.name);
                        if (!tool) {
                            this.addToolResult(toolCall.id, `Error: Tool ${toolCall.name} not found.`);
                            continue;
                        }
                        onUpdate({ status: 'tool_calling', tool: tool.name, args: toolCall.input });
                        // Permission Check: if tool is sensitive and mode is safe, request approval from UI
                        let execArgs = toolCall.input;
                        if (tool.sensitive && this.mode === 'safe') {
                            // notify UI and wait for approval
                            onUpdate({ status: 'permission', tool: tool.name, args: toolCall.input, id: toolCall.id });
                            // create a promise and wait for UI to respond
                            const approval = await new Promise((resolve, reject) => {
                                this.pendingApprovals.set(toolCall.id, { resolve, reject });
                                // Note: UI should call `respondToApproval(toolUseId, approved, editedArgs)` to resolve
                            });
                            if (!approval.approved) {
                                this.addToolResult(toolCall.id, `Permission denied for tool ${tool.name}.`);
                                continue; // skip execution
                            }
                            if (approval.args)
                                execArgs = approval.args;
                        }
                        try {
                            const result = await tool.execute(execArgs);
                            this.addToolResult(toolCall.id, typeof result === 'string' ? result : JSON.stringify(result));
                        }
                        catch (error) {
                            this.addToolResult(toolCall.id, `Error: ${error.message}`);
                        }
                    }
                }
                else if (!textBlock) {
                    isRunning = false;
                }
            }
            catch (error) {
                onUpdate({ status: 'message', content: `API Error: ${error.message}` });
                isRunning = false;
            }
        }
    }
    addToolResult(toolId, content) {
        this.messageHistory.push({
            role: 'user',
            content: [
                {
                    type: 'tool_result',
                    tool_use_id: toolId,
                    content: content
                }
            ]
        });
    }
}
exports.AgentLoop = AgentLoop;
