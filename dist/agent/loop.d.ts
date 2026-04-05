export declare class AgentLoop {
    private client;
    private apiKey?;
    private isStub;
    private messageHistory;
    private mode;
    private pendingApprovals;
    constructor(apiKey?: string);
    setApiKey(key: string): void;
    setMode(mode: 'safe' | 'yolo'): void;
    respondToApproval(toolUseId: string, approved: boolean, editedArgs?: any): boolean;
    run(userInput: string, onUpdate: (state: any) => void): Promise<void>;
    private addToolResult;
}
