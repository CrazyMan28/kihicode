import { useState, useCallback } from 'react';

export interface Message {
  role: 'user' | 'agent' | 'system';
  content: string;
}

export interface TerminalLog {
  type: 'info' | 'error' | 'command' | 'stdout' | 'stderr';
  content: string;
}

export const useAgentStore = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'Kihicode v1.0.0 initialized.' }
  ]);
  const [terminalLogs, setTerminalLogs] = useState<TerminalLog[]>([]);
  const [status, setStatus] = useState<'idle' | 'thinking' | 'acting' | 'done'>('idle');
  const [thoughts, setThoughts] = useState<string>('');
  const [verbose, setVerbose] = useState<boolean>(false);
  
  const [isWebsiteOn, setIsWebsiteOn] = useState(false);
  
  // Modals / Selection States
  const [selectionType, setSelectionType] = useState<'session' | 'login' | 'model' | null>(null);
  const [selectionList, setSelectionList] = useState<string[]>([]);
  const [onSelectCallback, setOnSelectCallback] = useState<{ cb: (val: string) => void }>({ cb: () => {} });

  const [sessions] = useState<string[]>(['initial-project-setup', 'refactor-auth-loop', 'ui-overhaul-v1']);
  const [loggedInProviders, setLoggedInProviders] = useState<string[]>([]);
  const [activeModel, setActiveModel] = useState('gpt-4o');

  // Secret input trigger for App.tsx
  const [pendingSecretProvider, setPendingSecretProvider] = useState<string | null>(null);

  const addMessage = useCallback((role: 'user' | 'agent' | 'system', content: string) => {
    setMessages(prev => [...prev, { role, content }]);
  }, []);

  const addLog = useCallback((type: 'info' | 'error' | 'command' | 'stdout' | 'stderr', content: string) => {
    setTerminalLogs(prev => [...prev, { type, content }]);
  }, []);

  const clearLogs = useCallback(() => {
    setTerminalLogs([]);
    setMessages([]);
  }, []);

  const toggleVerbose = useCallback(() => {
    setVerbose(prev => !prev);
  }, []);

  const openSelection = useCallback((type: 'session' | 'login' | 'model', list: string[], callback: (val: string) => void) => {
    setSelectionType(type);
    setSelectionList(list);
    setOnSelectCallback({ cb: callback });
  }, []);

  const _triggerSecretInput = useCallback((provider: string) => {
    setPendingSecretProvider(provider);
  }, []);

  return {
    messages,
    terminalLogs,
    status,
    thoughts,
    verbose,
    isWebsiteOn,
    selectionType,
    selectionList,
    onSelect: onSelectCallback.cb,
    sessions,
    loggedInProviders,
    activeModel,
    pendingSecretProvider,
    addMessage,
    addLog,
    clearLogs,
    toggleVerbose,
    setStatus,
    setThoughts,
    setIsWebsiteOn,
    setLoggedInProviders,
    setActiveModel,
    setPendingSecretProvider,
    openSelection,
    _triggerSecretInput,
    closeSelection: () => setSelectionType(null)
  };
};

export type AgentStore = ReturnType<typeof useAgentStore>;
