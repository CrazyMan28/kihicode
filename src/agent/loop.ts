let Anthropic: any = null;
try {
  // require the SDK only if available; this keeps the project runnable without the dependency
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@anthropic-ai/sdk');
  Anthropic = mod && (mod.default || mod);
} catch (e) {
  Anthropic = null;
}
import { registry } from '../tools/registry';

export class AgentLoop {
  private client: any;
  private apiKey?: string;
  private isStub: boolean = false;
  private messageHistory: any[] = [];
  private mode: 'safe' | 'yolo' = 'safe';
  // pending approvals map: tool_use_id -> {resolve, reject}
  private pendingApprovals: Map<string, { resolve: (v: any) => void; reject: (e: any) => void }> = new Map();

  constructor(apiKey?: string) {
    if (apiKey) {
      this.setApiKey(apiKey);
    } else {
      this.isStub = true;
      this.client = null;
    }
  }

  setApiKey(key: string) {
    this.apiKey = key;
    try {
      this.client = new Anthropic({ apiKey: key });
      this.isStub = false;
    } catch (err) {
      // fallback to stub
      this.isStub = true;
      this.client = null;
    }
  }

  setMode(mode: 'safe' | 'yolo') {
    this.mode = mode;
  }

  // Called by UI to respond to a pending approval request
  respondToApproval(toolUseId: string, approved: boolean, editedArgs?: any) {
    const pending = this.pendingApprovals.get(toolUseId);
    if (!pending) return false;
    pending.resolve({ approved, args: editedArgs });
    this.pendingApprovals.delete(toolUseId);
    return true;
  }

  async run(userInput: string, onUpdate: (state: any) => void) {
    this.messageHistory.push({ role: 'user', content: userInput });
    
    let isRunning = true;
    while (isRunning) {
      onUpdate({ status: 'thinking' });

      try {
        let response: any;
        if (this.isStub || !this.client) {
          // simple local stub: echo and helpful hint
          const lastUser = this.messageHistory.slice().reverse().find((m: any) => m.role === 'user');
          const lastText = lastUser ? (typeof lastUser.content === 'string' ? lastUser.content : JSON.stringify(lastUser.content)) : '';
          response = {
            content: [
              { type: 'text', text: `No LLM configured. To enable full AI features set ANTHROPIC_API_KEY in your .env or run '/auth <key>'.\n\nStub reply (echo): ${lastText}` }
            ]
          };
        } else {
          response = await this.client.messages.create({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 4096,
            messages: this.messageHistory,
            tools: registry.getAllTools().map(t => ({
              name: t.name,
              description: t.description,
              input_schema: {
                type: 'object',
                properties: t.schema.shape,
              }
            }))
          });
        }

        const textBlock = response.content.find((c: any) => c.type === 'text');
        const toolCalls = response.content.filter((c: any) => c.type === 'tool_use');

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
            const tool = registry.getTool(toolCall.name);
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
              const approval = await new Promise<{ approved: boolean; args?: any }>((resolve, reject) => {
                this.pendingApprovals.set(toolCall.id, { resolve, reject });
                // Note: UI should call `respondToApproval(toolUseId, approved, editedArgs)` to resolve
              });

              if (!approval.approved) {
                this.addToolResult(toolCall.id, `Permission denied for tool ${tool.name}.`);
                continue; // skip execution
              }

              if (approval.args) execArgs = approval.args;
            }

            try {
              const result = await tool.execute(execArgs);
              this.addToolResult(toolCall.id, typeof result === 'string' ? result : JSON.stringify(result));
            } catch (error: any) {
              this.addToolResult(toolCall.id, `Error: ${error.message}`);
            }
          }
        } else if (!textBlock) {
          isRunning = false;
        }
      } catch (error: any) {
        onUpdate({ status: 'message', content: `API Error: ${error.message}` });
        isRunning = false;
      }
    }
  }

  private addToolResult(toolId: string, content: string) {
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
