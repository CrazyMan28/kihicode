import { generateText, tool } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';
import { Tools } from './tools.js';
import { AuthStore } from '../config/auth.js';
import { PluginLoader } from './plugins.js';
import fs from 'fs-extra';
export const AgentLoop = {
    private_apiKey: '',
    setApiKey(key) {
        this.private_apiKey = key;
    },
    async run(query, onUpdate, options = {}) {
        let processedQuery = query;
        // Support @filename syntax
        const fileMatches = query.match(/@([\w\.\/]+)/g);
        if (fileMatches) {
            for (const match of fileMatches) {
                const filePath = match.slice(1);
                try {
                    const content = await fs.readFile(filePath, 'utf-8');
                    processedQuery = processedQuery.replace(match, `\nFile: ${filePath}\nContent:\n${content}\n`);
                }
                catch (err) { }
            }
        }
        let loops = 0;
        const maxLoops = options.maxLoops || 1;
        const auth = new AuthStore();
        const apiKey = this.private_apiKey || auth.getKey('openai');
        if (!apiKey) {
            onUpdate({ role: 'system', message: 'Error: OpenAI API key not found. Use /login to set it.' });
            return;
        }
        const openai = createOpenAI({ apiKey });
        while (loops < maxLoops) {
            onUpdate({ role: 'system', status: 'thinking', message: loops === 0 ? `Processing: ${query}` : `Autopilot loop ${loops + 1}/${maxLoops}` });
            try {
                const plugins = await PluginLoader.loadPlugins();
                const { text } = await generateText({
                    model: openai('gpt-4o'),
                    system: `You are Kihicode, a senior agentic AI. 
          You have full access to the shell and filesystem. 
          When you need to act, use the available tools. 
          Always explain your plan before using tools.
          If in Autopilot mode, once a task is done, suggest a new feature or an audit to perform.`,
                    prompt: processedQuery,
                    tools: {
                        executeShell: tool({
                            description: 'Execute a bash command securely',
                            parameters: z.object({
                                command: z.string().describe('The command to run')
                            }),
                            execute: async ({ command }) => {
                                onUpdate({ logType: 'command', log: command, status: 'acting' });
                                const result = await Tools.executeShell(command);
                                onUpdate({
                                    logType: result.exitCode === 0 ? 'stdout' : 'stderr',
                                    log: result.stdout || result.stderr
                                });
                                return result;
                            }
                        }),
                        readFile: tool({
                            description: 'Read a file from the filesystem',
                            parameters: z.object({
                                path: z.string().describe('Path to the file')
                            }),
                            execute: async ({ path }) => {
                                return await Tools.readFile(path);
                            }
                        }),
                        writeFile: tool({
                            description: 'Write a file to the filesystem',
                            parameters: z.object({
                                path: z.string().describe('Path to the file'),
                                content: z.string().describe('Content to write')
                            }),
                            execute: async ({ path, content }) => {
                                return await Tools.writeFile(path, content);
                            }
                        }),
                        createCustomTool: tool({
                            description: 'Create a new custom tool/plugin for the current session',
                            parameters: z.object({
                                name: z.string().describe('Name of the tool'),
                                description: z.string().describe('Description of what it does'),
                                code: z.string().describe('TS code for the execute function body')
                            }),
                            execute: async ({ name, description, code }) => {
                                const p = await PluginLoader.createPlugin(name, description, code);
                                onUpdate({ logType: 'info', log: `New tool created: ${name} at ${p}` });
                                return { success: true, path: p };
                            }
                        }),
                        ...plugins
                    },
                    maxSteps: 20
                });
                onUpdate({ role: 'agent', message: text, status: 'done' });
                loops++;
                if (loops < maxLoops) {
                    processedQuery = `The previous task is complete. Review the codebase and suggest a new feature or security audit to perform. Then proceed to implement it.`;
                }
            }
            catch (err) {
                onUpdate({ role: 'system', message: `Error: ${err.message}`, status: 'idle' });
                break;
            }
        }
    },
    async process(query, store, options = {}) {
        // Adapter for TUI store
        await this.run(query, (state) => {
            if (state.message)
                store.addMessage(state.role || 'agent', state.message);
            if (state.log)
                store.addLog(state.logType || 'info', state.log);
            if (state.status)
                store.setStatus(state.status);
        }, options);
    },
    async plan(query, store) {
        const auth = new AuthStore();
        const apiKey = this.private_apiKey || auth.getKey('openai');
        if (!apiKey) {
            store.addMessage('agent', 'Error: OpenAI API key not found.');
            return;
        }
        const openai = createOpenAI({ apiKey });
        store.setStatus('thinking');
        const { text } = await generateText({
            model: openai('gpt-4o'),
            system: 'You are an architect. Provide a step-by-step breakdown. DO NOT execute tools.',
            prompt: query
        });
        store.addMessage('agent', text);
        store.setStatus('idle');
    },
    respondToApproval(id, approved, args) {
        // Placeholder for human-in-the-loop
        return true;
    }
};
//# sourceMappingURL=loop.js.map