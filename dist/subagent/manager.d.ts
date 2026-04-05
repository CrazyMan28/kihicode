export declare class SubagentManager {
    private jobs;
    start(fn: () => Promise<any>): string;
    list(): any[];
    status(id: string): any;
}
export declare const subagentManager: SubagentManager;
