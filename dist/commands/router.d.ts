import { AgentStore } from '../store/agentStore.js';
export declare const CommandRouter: {
    execute(cmd: string, store: AgentStore): Promise<void>;
};
