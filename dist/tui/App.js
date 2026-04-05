import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { ChatPane } from './components/ChatPane.js';
import { TerminalPane } from './components/TerminalPane.js';
import { StatusLine } from './components/StatusLine.js';
import { SessionManager } from './components/SessionManager.js';
import { CommandPalette } from './components/CommandPalette.js';
import { CommandRouter } from '../commands/router.js';
import { AgentLoop } from '../agent/loop.js';
import { useAgentStore } from '../store/agentStore.js';
import { AuthStore } from '../config/auth.js';
import { WebsiteController } from '../server/web.js';
const ALL_COMMANDS = [
    '/plan', '/build', '/autopilot', '/clear', '/website on', '/website off',
    '/session list', '/compact', '/config', '/context', '/cost', '/diff',
    '/edit', '/init', '/model', '/memory', '/mcp', '/auth', '/help'
];
export const KihicodeApp = ({ initialCommand }) => {
    const { exit } = useApp();
    const [input, setInput] = useState('');
    const [isSecret, setIsSecret] = useState(false);
    const [secretType, setSecretType] = useState('');
    const [permissionMode, setPermissionMode] = useState('Default');
    const [paletteIndex, setPaletteIndex] = useState(0);
    const [filteredCommands, setFilteredCommands] = useState([]);
    const agentStore = useAgentStore();
    useEffect(() => {
        if (input.startsWith('/') && !isSecret) {
            const query = input.toLowerCase().split(' ')[0];
            const filtered = ALL_COMMANDS.filter(cmd => cmd.toLowerCase().startsWith(query));
            setFilteredCommands(filtered);
            setPaletteIndex(0);
        }
        else {
            setFilteredCommands([]);
        }
    }, [input, isSecret]);
    useInput((char, key) => {
        if (agentStore.showSessionManager)
            return;
        if (key.escape) {
            exit();
            return;
        }
        // Command Palette Navigation
        if (filteredCommands.length > 0) {
            if (key.upArrow) {
                setPaletteIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
                return;
            }
            if (key.downArrow) {
                setPaletteIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
                return;
            }
            if (key.tab) {
                setInput(filteredCommands[paletteIndex] + ' ');
                return;
            }
        }
        if (key.ctrl && char === 'c') {
            setInput('');
            agentStore.addMessage('system', 'Input cancelled.');
            return;
        }
        if (key.ctrl && char === 'l') {
            agentStore.clearLogs();
            return;
        }
        if (key.ctrl && char === 'o') {
            agentStore.toggleVerbose();
            agentStore.addMessage('system', `Verbose mode: ${agentStore.verbose ? 'ON' : 'OFF'}`);
            return;
        }
        if (key.shift && key.tab) {
            const modes = ['Default', 'Plan', 'Bypass'];
            const nextIdx = (modes.indexOf(permissionMode) + 1) % modes.length;
            setPermissionMode(modes[nextIdx]);
            agentStore.addMessage('system', `Permission Mode: ${modes[nextIdx]}`);
            return;
        }
        if (key.return) {
            if (input.trim()) {
                handleCommand(input);
                setInput('');
            }
        }
        else if (key.backspace || key.delete) {
            setInput(prev => prev.slice(0, -1));
        }
        else if (char && !key.ctrl && !key.meta) {
            setInput(prev => prev + char);
        }
    });
    const handleCommand = async (cmd) => {
        if (isSecret) {
            const auth = new AuthStore();
            auth.setKey(secretType, cmd);
            agentStore.addMessage('system', `${secretType.toUpperCase()} API Key saved.`);
            setIsSecret(false);
            setSecretType('');
            return;
        }
        if (cmd.startsWith('/')) {
            await CommandRouter.execute(cmd, agentStore);
        }
        else {
            await AgentLoop.process(cmd, agentStore);
        }
    };
    useEffect(() => {
        if (agentStore.isWebsiteOn) {
            WebsiteController.start();
        }
        else {
            WebsiteController.stop();
        }
    }, [agentStore.isWebsiteOn]);
    return (_jsxs(Box, { flexDirection: "column", height: "100%", width: "100%", padding: 1, children: [agentStore.showSessionManager && (_jsx(SessionManager, { sessions: agentStore.sessions, onSelect: (session) => {
                    agentStore.addMessage('system', `Switching to session: ${session}`);
                    agentStore.setShowSessionManager(false);
                }, onClose: () => agentStore.setShowSessionManager(false) })), _jsxs(Box, { flexDirection: "row", justifyContent: "space-between", marginBottom: 1, children: [_jsx(Text, { bold: true, color: "cyan", children: "KIHICODE OS v1.0.0" }), _jsxs(Box, { children: [_jsx(Text, { color: "gray", children: "Mode: " }), _jsx(Text, { color: permissionMode === 'Bypass' ? 'red' : permissionMode === 'Plan' ? 'yellow' : 'green', children: permissionMode }), _jsx(Text, { color: "gray", children: " | Web: " }), _jsx(Text, { color: agentStore.isWebsiteOn ? 'green' : 'red', children: agentStore.isWebsiteOn ? 'ON' : 'OFF' })] })] }), _jsxs(Box, { flexGrow: 1, flexDirection: "row", borderStyle: "round", borderColor: "cyan", children: [_jsxs(Box, { width: "40%", flexDirection: "column", paddingX: 1, borderStyle: "single", borderRight: true, children: [_jsx(Box, { borderStyle: "single", borderColor: "yellow", paddingX: 1, marginBottom: 1, children: _jsx(Text, { color: "yellow", bold: true, underline: true, children: "\uD83D\uDDE8\uFE0F AGENT CHAT" }) }), _jsx(ChatPane, { messages: agentStore.messages })] }), _jsxs(Box, { width: "60%", flexDirection: "column", paddingX: 1, children: [_jsx(Box, { borderStyle: "single", borderColor: "green", paddingX: 1, marginBottom: 1, children: _jsx(Text, { color: "green", bold: true, underline: true, children: "\uD83D\uDCBB TERMINAL OUTPUT" }) }), _jsx(TerminalPane, { logs: agentStore.terminalLogs })] })] }), _jsx(StatusLine, { status: agentStore.status, thoughts: agentStore.thoughts }), _jsxs(Box, { flexDirection: "column", marginTop: 1, children: [filteredCommands.length > 0 && (_jsx(Box, { marginBottom: 1, marginLeft: 2, children: _jsx(CommandPalette, { commands: filteredCommands, selectedIndex: paletteIndex }) })), _jsxs(Box, { paddingX: 1, borderStyle: "round", borderColor: "white", children: [_jsx(Text, { color: "cyan", bold: true, children: "kihicode> " }), _jsx(Text, { children: isSecret ? '•'.repeat(input.length) : input }), _jsx(Text, { color: "white", inverse: true, children: " " })] })] })] }));
};
//# sourceMappingURL=App.js.map