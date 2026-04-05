import { useState, useCallback } from 'react';
export const useAgentStore = () => {
    const [messages, setMessages] = useState([
        { role: 'system', content: 'Kihicode v1.0.0 initialized.' }
    ]);
    const [terminalLogs, setTerminalLogs] = useState([]);
    const [status, setStatus] = useState('idle');
    const [thoughts, setThoughts] = useState('');
    const [verbose, setVerbose] = useState(false);
    // New States
    const [isWebsiteOn, setIsWebsiteOn] = useState(false);
    const [showSessionManager, setShowSessionManager] = useState(false);
    const [sessions, setSessions] = useState(['initial-project-setup', 'refactor-auth-loop', 'ui-overhaul-v1']);
    const addMessage = useCallback((role, content) => {
        setMessages(prev => [...prev, { role, content }]);
    }, []);
    const addLog = useCallback((type, content) => {
        setTerminalLogs(prev => [...prev, { type, content }]);
    }, []);
    const clearLogs = useCallback(() => {
        setTerminalLogs([]);
        setMessages([]);
    }, []);
    const toggleVerbose = useCallback(() => {
        setVerbose(prev => !prev);
    }, []);
    return {
        messages,
        terminalLogs,
        status,
        thoughts,
        verbose,
        isWebsiteOn,
        showSessionManager,
        sessions,
        addMessage,
        addLog,
        clearLogs,
        toggleVerbose,
        setStatus,
        setThoughts,
        setIsWebsiteOn,
        setShowSessionManager,
        setSessions
    };
};
//# sourceMappingURL=agentStore.js.map