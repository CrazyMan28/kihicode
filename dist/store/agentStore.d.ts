export interface Message {
    role: 'user' | 'agent' | 'system';
    content: string;
}
export interface TerminalLog {
    type: 'info' | 'error' | 'command' | 'stdout' | 'stderr';
    content: string;
}
export declare const useAgentStore: () => {
    messages: Message[];
    terminalLogs: TerminalLog[];
    status: "idle" | "thinking" | "acting" | "done";
    thoughts: string;
    verbose: boolean;
    isWebsiteOn: boolean;
    showSessionManager: boolean;
    sessions: string[];
    addMessage: (role: "user" | "agent" | "system", content: string) => void;
    addLog: (type: "info" | "error" | "command" | "stdout" | "stderr", content: string) => void;
    clearLogs: () => void;
    toggleVerbose: () => void;
    setStatus: import("react").Dispatch<import("react").SetStateAction<"idle" | "thinking" | "acting" | "done">>;
    setThoughts: import("react").Dispatch<import("react").SetStateAction<string>>;
    setIsWebsiteOn: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    setShowSessionManager: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    setSessions: import("react").Dispatch<import("react").SetStateAction<string[]>>;
};
export type AgentStore = ReturnType<typeof useAgentStore>;
