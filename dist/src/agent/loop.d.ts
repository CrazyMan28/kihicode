export declare class AgentLoop {
    private client;
    private messageHistory;
    private mode;
    private pendingApprovals;
    constructor(apiKey: string);
    setMode(mode: 'safe' | 'yolo'): void;
    respondToApproval(toolUseId: string, approved: boolean, editedArgs?: any): boolean;
    run(userInput: string, onUpdate: (state: any) => void): Promise<void>;
    private addToolResult;
}
