export interface AgentState {
    role?: 'agent' | 'system' | 'user';
    message?: string;
    log?: string;
    logType?: 'info' | 'error' | 'command' | 'stdout' | 'stderr';
    status?: string;
}
export declare const AgentLoop: {
    private_apiKey: string;
    setApiKey(key: string): void;
    run(query: string, onUpdate: (state: AgentState) => void, options?: {
        maxLoops?: number;
    }): Promise<void>;
    process(query: string, store: any, options?: {
        maxLoops?: number;
    }): Promise<void>;
    plan(query: string, store: any): Promise<void>;
    respondToApproval(id: string, approved: boolean, args: any): boolean;
};
