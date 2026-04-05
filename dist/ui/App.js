import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import Palette from './Palette.js';
import { registry, initCommands } from '../commands.js';
import runPythonAgent from '../utils/runPythonAgent.js';
import { subagentManager } from '../subagent/manager.js';
import AuthStore from '../auth/store.js';
import { AgentLoop } from '../agent/loop.js';
import { registerFsTools } from '../tools/definitions/fs.js';
import { registerShellTools } from '../tools/definitions/shell.js';
import { registerAgentTools } from '../tools/definitions/agent.js';
import { registerDynamicTools } from '../tools/definitions/dynamic.js';
import * as fs from 'node:fs/promises';
import path from 'node:path';
export const App = ({ initialDir }) => {
    const [query, setQuery] = useState('');
    const [messages, setMessages] = useState([]);
    const [status, setStatus] = useState('idle');
    const [currentTool, setCurrentTool] = useState(null);
    const [permissionRequest, setPermissionRequest] = useState(null);
    const [showHelp, setShowHelp] = useState(false);
    const [theme, setTheme] = useState('dark');
    const [scrollOffset, setScrollOffset] = useState(0);
    const [autoScroll, setAutoScroll] = useState(true);
    const [clock, setClock] = useState(() => new Date().toLocaleTimeString());
    const [modeState, setModeState] = useState(process.env.KIHICODE_MODE || 'safe');
    const { exit } = useApp();
    const [paletteOpen, setPaletteOpen] = useState(false);
    const [authStore] = useState(() => new AuthStore());
    const [files, setFiles] = useState([]);
    const [agent] = useState(() => {
        const apiKey = process.env.ANTHROPIC_API_KEY || '';
        return new AgentLoop(apiKey);
    });
    useEffect(() => {
        registerFsTools();
        registerShellTools();
        registerAgentTools();
        registerDynamicTools().catch(console.error);
        // Ensure commands are initialized for the UI palette
        try {
            initCommands().catch(() => { });
        }
        catch {
            // ignore
        }
        const envMode = process.env.KIHICODE_MODE;
        if (envMode) {
            setTimeout(() => {
                // @ts-ignore
                if (agent && typeof agent.setMode === 'function')
                    agent.setMode(envMode);
            }, 0);
        }
        setMessages([
            {
                role: 'system',
                content: `Kihicode initialized in ${initialDir}. \nType /help for commands or /plan to architect your next move.`
            }
        ]);
        // load files from initialDir for quick access
        (async () => {
            try {
                const entries = await fs.readdir(initialDir || process.cwd());
                const fileNames = [];
                for (const e of entries) {
                    try {
                        const stat = await fs.stat(path.join(initialDir || process.cwd(), e));
                        if (stat.isFile())
                            fileNames.push(e);
                    }
                    catch {
                        // ignore
                    }
                    if (fileNames.length >= 9)
                        break;
                }
                setFiles(fileNames);
            }
            catch {
                setFiles([]);
            }
        })();
    }, [initialDir]);
    const themeColors = theme === 'dark' ? {
        header: 'cyan',
        accent: 'magenta',
        muted: 'gray',
        welcome: 'yellow',
        mascot: 'red'
    } : {
        header: 'blue',
        accent: 'magenta',
        muted: 'black',
        welcome: 'black',
        mascot: 'red'
    };
    // keyboard shortcuts
    useInput((input, key) => {
        if (key.ctrl && input === 'h') {
            setShowHelp(v => !v);
            return;
        }
        // quick open via number keys 1-9
        if (/^[1-9]$/.test(input)) {
            const idx = parseInt(input, 10) - 1;
            const f = files[idx];
            if (f) {
                // open file and display its content
                (async () => {
                    try {
                        const content = await fs.readFile(path.join(initialDir || process.cwd(), f), 'utf8');
                        setMessages(prev => [...prev, { role: 'system', content: `Opened file: ${f}` }, { role: 'assistant', content: content }]);
                        setAutoScroll(true);
                    }
                    catch (err) {
                        setMessages(prev => [...prev, { role: 'system', content: `Failed to open ${f}: ${err?.message || err}` }]);
                    }
                })();
            }
            return;
        }
        if (key.ctrl && input === 'q') {
            exit();
            return;
        }
        if (key.ctrl && input === 't') {
            setTheme(t => t === 'dark' ? 'light' : 'dark');
            setMessages(prev => [...prev, { role: 'system', content: `Theme switched to ${theme === 'dark' ? 'light' : 'dark'}.` }]);
            return;
        }
        if (key.ctrl && input === 'b') {
            setMessages(prev => [...prev, { role: 'system', content: `Backgrounding current command (simulated).` }]);
            return;
        }
        // open palette when user types '/'
        if (input === '/' && !paletteOpen && query.trim() === '') {
            setPaletteOpen(true);
            return;
        }
        // scrolling keys - when user scrolls, disable autoScroll
        if (key.up) {
            setAutoScroll(false);
            setScrollOffset(s => Math.max(0, s - 1));
            return;
        }
        if (key.down) {
            setAutoScroll(false);
            setScrollOffset(s => s + 1);
            return;
        }
        if (key.pageUp) {
            setAutoScroll(false);
            setScrollOffset(s => Math.max(0, s - Math.floor(messagesHeight / 2)));
            return;
        }
        if (key.pageDown) {
            setAutoScroll(false);
            setScrollOffset(s => s + Math.floor(messagesHeight / 2));
            return;
        }
        if (key.home) {
            setAutoScroll(false);
            setScrollOffset(0);
            return;
        }
        if (key.end) {
            setAutoScroll(true);
            // scroll to bottom handled by effect when messages change
            return;
        }
    });
    // responsive layout helpers
    const cols = Math.max(40, process.stdout?.columns || 80);
    const rows = Math.max(20, process.stdout?.rows || 24);
    const headerHeight = Math.min(Math.max(10, Math.floor(rows * 0.38)), rows - 8);
    const inputHeight = 3;
    const messagesHeight = Math.max(6, rows - headerHeight - inputHeight - 6);
    const framedBoxLines = (width, height, contentLines) => {
        const innerW = Math.max(4, width - 2);
        const top = '┌' + '─'.repeat(innerW) + '┐';
        const bottom = '└' + '─'.repeat(innerW) + '┘';
        const empty = '│' + ' '.repeat(innerW) + '│';
        const lines = [];
        lines.push(top);
        const innerCount = Math.max(0, height - 2);
        const content = contentLines.map(l => l.slice(0, innerW));
        const topPad = Math.floor(Math.max(0, (innerCount - content.length) / 2));
        const bottomPad = Math.max(0, innerCount - content.length - topPad);
        for (let i = 0; i < topPad; i++)
            lines.push(empty);
        for (const c of content) {
            const left = Math.floor((innerW - c.length) / 2);
            const right = innerW - c.length - left;
            lines.push('│' + ' '.repeat(left) + c + ' '.repeat(right) + '│');
        }
        for (let i = 0; i < bottomPad; i++)
            lines.push(empty);
        lines.push(bottom);
        return lines;
    };
    const flattenMessagesToLines = (msgs) => {
        const out = [];
        for (const m of msgs) {
            out.push({ text: `${m.role.toUpperCase()}:`, role: m.role });
            const parts = m.content.split('\n');
            for (const p of parts)
                out.push({ text: `  ${p}`, role: m.role });
            out.push({ text: '' });
        }
        return out;
    };
    // ensure scrollOffset stays within bounds when messages or terminal size change
    useEffect(() => {
        const lines = flattenMessagesToLines(messages);
        const maxOffset = Math.max(0, lines.length - messagesHeight);
        if (autoScroll) {
            setScrollOffset(maxOffset);
        }
        else {
            setScrollOffset(s => Math.min(s, maxOffset));
        }
    }, [messages, rows, cols, messagesHeight]);
    // clock tick for status bar
    useEffect(() => {
        const t = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000);
        return () => clearInterval(t);
    }, []);
    const handleSubmit = async (value) => {
        setQuery('');
        // If there's a pending permission request, interpret this input as the response
        if (permissionRequest) {
            const input = value.trim();
            if (/^y(es)?$/i.test(input)) {
                agent.respondToApproval(permissionRequest.id, true);
                setMessages(prev => [...prev, { role: 'system', content: `Permission granted for ${permissionRequest.tool}.` }]);
                setPermissionRequest(null);
                return;
            }
            if (/^n(o)?$/i.test(input)) {
                agent.respondToApproval(permissionRequest.id, false);
                setMessages(prev => [...prev, { role: 'system', content: `Permission denied for ${permissionRequest.tool}.` }]);
                setPermissionRequest(null);
                return;
            }
            if (/^edit\s+/i.test(input)) {
                const jsonPart = input.replace(/^edit\s+/i, '').trim();
                try {
                    const parsed = JSON.parse(jsonPart);
                    agent.respondToApproval(permissionRequest.id, true, parsed);
                    setMessages(prev => [...prev, { role: 'system', content: `Permission granted (with edits) for ${permissionRequest.tool}.` }]);
                    setPermissionRequest(null);
                }
                catch (err) {
                    setMessages(prev => [...prev, { role: 'system', content: `Invalid JSON for edit: ${err?.message || err}` }]);
                }
                return;
            }
            setMessages(prev => [...prev, { role: 'system', content: `Unrecognized permission response. Reply with 'y', 'n', or 'edit <JSON>'.` }]);
            return;
        }
        if (value.startsWith('/exit')) {
            exit();
            return;
        }
        if (value.startsWith('/help')) {
            setMessages(prev => [...prev, { role: 'system', content: `\nAvailable commands:\n/plan        - Switch to architectural planning mode.\n/build <obj> - Execute the specified objective.\n/mode <m>    - Toggle between 'safe' and 'yolo' modes.\n/exit        - Close Kihicode.\n` }]);
            return;
        }
        if (value.startsWith('/mode')) {
            const newMode = value.split(' ')[1];
            if (newMode === 'safe' || newMode === 'yolo') {
                agent.setMode(newMode);
                setModeState(newMode);
                setMessages(prev => [...prev, { role: 'system', content: `Mode switched to ${newMode}.` }]);
            }
            else {
                setMessages(prev => [...prev, { role: 'system', content: `Invalid mode. Use /mode safe or /mode yolo.` }]);
            }
            return;
        }
        if (value.startsWith('/auth')) {
            const parts = value.split(' ');
            const key = parts.slice(1).join(' ').trim();
            if (!key) {
                setMessages(prev => [...prev, { role: 'system', content: `Usage: /auth <ANTHROPIC_API_KEY> — sets API key for this session.` }]);
                return;
            }
            try {
                // @ts-ignore
                agent.setApiKey(key);
                setMessages(prev => [...prev, { role: 'system', content: `API key set for this session. To persist, add ANTHROPIC_API_KEY to your .env.` }]);
            }
            catch (err) {
                setMessages(prev => [...prev, { role: 'system', content: `Failed to set API key: ${err?.message || err}` }]);
            }
            return;
        }
        // General slash-command handling: prefer built-in registry, otherwise spawn Python agent
        if (value.startsWith('/')) {
            const tokens = value.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
            const cleaned = tokens.map((t) => t.replace(/^"(.*)"$/, '$1'));
            const nameToken = cleaned[0] || '';
            const name = nameToken.startsWith('/') ? nameToken.slice(1) : nameToken;
            const cmd = registry.get(name);
            if (cmd) {
                const ctx = {
                    stdout: (msg) => setMessages(prev => [...prev, { role: 'system', content: msg }]),
                    exit: (code) => setMessages(prev => [...prev, { role: 'system', content: `Exit(${code ?? 0})` }]),
                    registry,
                    subagentManager,
                    authStore,
                };
                await registry.execute(value, ctx);
                return;
            }
            try {
                setMessages(prev => [...prev, { role: 'system', content: `Running external agent: ${cleaned.join(' ')}` }]);
                const res = await runPythonAgent(cleaned);
                if (res.stdout)
                    setMessages(prev => [...prev, { role: 'assistant', content: res.stdout }]);
                if (res.stderr)
                    setMessages(prev => [...prev, { role: 'system', content: `Agent stderr: ${res.stderr}` }]);
            }
            catch (err) {
                setMessages(prev => [...prev, { role: 'system', content: `Failed to run agent: ${err?.message || String(err)}` }]);
            }
            return;
        }
        setMessages(prev => [...prev, { role: 'user', content: value }]);
        try {
            await agent.run(value, (update) => {
                if (update.status === 'thinking') {
                    setStatus('Assistant is thinking...');
                }
                else if (update.status === 'tool_calling') {
                    setStatus(`Agent is calling tool: ${update.tool}`);
                    setCurrentTool(update.tool);
                }
                else if (update.status === 'permission') {
                    setStatus('awaiting permission');
                    setCurrentTool(update.tool);
                    setPermissionRequest({ id: update.id, tool: update.tool, args: update.args });
                    setMessages(prev => [...prev, { role: 'system', content: `Agent requests permission to run '${update.tool}' with args: ${JSON.stringify(update.args)}. Reply with 'y' to allow, 'n' to deny, or 'edit <JSON>' to modify the args.` }]);
                }
                else if (update.status === 'message') {
                    setStatus('idle');
                    setCurrentTool(null);
                    setMessages(prev => [...prev, { role: 'assistant', content: update.content }]);
                }
            });
        }
        catch (error) {
            setMessages(prev => [...prev, { role: 'system', content: `Error: ${error.message}` }]);
            setStatus('idle');
        }
    };
    return (_jsxs(Box, { flexDirection: "column", padding: 1, children: [paletteOpen && (_jsx(Box, { marginBottom: 1, children: _jsx(Palette, { commands: registry.list().map((c) => ({ name: c.name, description: c.description })), onSelect: (name) => { setQuery('/' + name + ' '); setPaletteOpen(false); }, onClose: () => setPaletteOpen(false) }) })), _jsxs(Box, { flexDirection: "row", gap: 1, marginBottom: 1, children: [_jsxs(Box, { flexGrow: 3, paddingRight: 1, children: [_jsx(Text, { color: themeColors.header, bold: true, children: "Kihicode v1.0.0" }), _jsx(Text, { color: themeColors.muted, children: "--- Agentic AI CLI ---" }), _jsx(Box, { marginTop: 1 }), (() => {
                                const leftW = Math.max(36, Math.floor(cols * 0.62));
                                const usage = [
                                    'Usage',
                                    '',
                                    '/help               Show commands',
                                    '/plan               Create architecture plans',
                                    '/build <target>     Execute the specified objective',
                                    '/mode <safe|yolo>   Toggle permission mode',
                                    '/auth <key>         Set API key for this session',
                                    '/exit               Quit the app',
                                ];
                                const leftLines = framedBoxLines(leftW, headerHeight, usage);
                                return _jsx(Text, { color: themeColors.muted, children: leftLines.join('\n') });
                            })(), _jsxs(Box, { marginTop: 1, children: [_jsx(Text, { color: themeColors.accent, children: "Files:" }), _jsxs(Text, { children: [" ", files.map((f, i) => `[${i + 1}] ${f}`).join('  ')] })] })] }), _jsx(Box, { flexGrow: 2, children: (() => {
                            const rightW = Math.max(24, Math.floor(cols * 0.32));
                            const halfH = Math.max(6, Math.floor((headerHeight - 2) / 2));
                            const recentItems = [
                                '1m ago  Updated project memory',
                                "8m ago  Updated claw'd feed",
                                '2d ago  Add new words to spinner',
                                '1w ago  Update unit tests',
                                '.../resume for more'
                            ];
                            const freshItems = [
                                '/agents to create subagents',
                                '/security-review for review agent',
                                'ctrl+b to background bashes',
                                '... /help for more'
                            ];
                            const recentLines = framedBoxLines(rightW, halfH + 2, ['Recent activity', '', ...recentItems]);
                            const freshLines = framedBoxLines(rightW, headerHeight - (halfH + 2), ["What's new", '', ...freshItems]);
                            return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: themeColors.muted, children: recentLines.join('\n') }), _jsx(Box, { marginTop: 1 }), _jsx(Text, { color: themeColors.muted, children: freshLines.join('\n') })] }));
                        })() })] }), showHelp && (_jsxs(Box, { borderStyle: "double", padding: 1, flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { bold: true, color: themeColors.accent, children: "Keyboard Shortcuts" }), _jsx(Box, { marginTop: 1 }), _jsx(Text, { color: themeColors.muted, children: "Ctrl+H \u2014 Toggle this help" }), _jsx(Text, { color: themeColors.muted, children: "Ctrl+Q \u2014 Quit" }), _jsx(Text, { color: themeColors.muted, children: "Ctrl+T \u2014 Toggle theme" }), _jsx(Text, { color: themeColors.muted, children: "Ctrl+B \u2014 Background current command (simulated)" }), _jsx(Text, { color: themeColors.muted, children: "Enter \u2014 Submit input" }), _jsx(Box, { marginTop: 1 }), _jsx(Text, { color: themeColors.muted, children: "Type /help for commands. Press Ctrl+H to close." })] })), _jsx(Box, { borderStyle: "single", padding: 1, flexDirection: "column", flexGrow: 1, marginBottom: 1, children: (() => {
                    const allLines = flattenMessagesToLines(messages);
                    const maxOffset = Math.max(0, allLines.length - messagesHeight);
                    const offset = Math.max(0, Math.min(scrollOffset, maxOffset));
                    const visible = allLines.slice(offset, offset + messagesHeight);
                    if (visible.length === 0)
                        return _jsx(Text, { color: themeColors.muted, children: "No messages yet \u2014 try a command or chat with the assistant." });
                    // build scrollbar track
                    const totalLines = allLines.length;
                    const trackHeight = messagesHeight;
                    const scrollbarChars = [];
                    if (totalLines > trackHeight) {
                        const thumbHeight = Math.max(1, Math.floor(trackHeight * trackHeight / totalLines));
                        const maxThumbTop = trackHeight - thumbHeight;
                        const thumbTop = Math.floor(((offset) / Math.max(1, totalLines - trackHeight)) * maxThumbTop);
                        for (let j = 0; j < trackHeight; j++) {
                            scrollbarChars.push(j >= thumbTop && j < thumbTop + thumbHeight ? '█' : '│');
                        }
                    }
                    else {
                        for (let j = 0; j < trackHeight; j++)
                            scrollbarChars.push(' ');
                    }
                    return (_jsx(Box, { flexDirection: "column", children: visible.map((ln, i) => {
                            const scChar = scrollbarChars[i] || ' ';
                            if (!ln.text)
                                return (_jsxs(Box, { flexDirection: "row", children: [_jsx(Box, { flexGrow: 1, children: _jsx(Text, { children: ' ' }) }), _jsx(Box, { width: 2, children: _jsx(Text, { color: themeColors.accent, children: scChar }) })] }, i));
                            const isLabel = ln.text.endsWith(':') && ln.role;
                            const color = ln.role === 'user' ? 'green' : ln.role === 'assistant' ? themeColors.header : 'yellow';
                            return (_jsxs(Box, { flexDirection: "row", children: [_jsx(Box, { flexGrow: 1, children: isLabel ? (_jsx(Text, { bold: true, color: color, children: ln.text })) : (_jsx(Text, { children: ln.text })) }), _jsx(Box, { width: 2, children: _jsx(Text, { color: scChar === '█' ? themeColors.accent : themeColors.muted, children: scChar }) })] }, i));
                        }) }));
                })() }), _jsx(Box, { children: _jsx(Text, { color: "gray", children: Array(Math.max(10, (process.stdout?.columns || 80) - 2)).fill('─').join('') }) }), _jsxs(Box, { children: [_jsx(Text, { color: "white", bold: true, children: "\u276F " }), _jsxs(Box, { flexDirection: "column", flexGrow: 1, children: [_jsx(TextInput, { value: query, onChange: setQuery, onSubmit: handleSubmit, placeholder: 'try "edit < filepath > to ..."' }), status !== 'idle' && (_jsx(Box, { marginTop: 1, children: _jsxs(Text, { color: "yellow", children: [_jsx(Spinner, { type: "dots" }), " ", status, " ", currentTool && `(${currentTool})`] }) }))] })] }), _jsxs(Box, { marginTop: 1, paddingX: 1, children: [_jsx(Box, { flexGrow: 1, children: _jsx(Text, { color: themeColors.muted, children: clock }) }), _jsx(Box, { children: _jsxs(Text, { color: themeColors.accent, children: ["Mode: ", modeState] }) }), _jsx(Box, { marginLeft: 2, children: _jsx(Text, { color: "gray", children: initialDir }) })] })] }));
};
//# sourceMappingURL=App.js.map