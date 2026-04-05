import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text, useInput } from 'ink';
export const SessionManager = ({ sessions, onSelect, onClose }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    useInput((input, key) => {
        if (key.upArrow) {
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : sessions.length - 1));
        }
        if (key.downArrow) {
            setSelectedIndex(prev => (prev < sessions.length - 1 ? prev + 1 : 0));
        }
        if (key.return) {
            onSelect(sessions[selectedIndex]);
        }
        if (key.escape) {
            onClose();
        }
    });
    return (_jsx(Box, { position: "absolute", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", children: _jsxs(Box, { flexDirection: "column", borderStyle: "double", borderColor: "cyan", padding: 1, width: 50, minHeight: 10, children: [_jsx(Box, { justifyContent: "center", marginBottom: 1, children: _jsx(Text, { bold: true, color: "yellow", underline: true, children: "SESSION MANAGER" }) }), _jsx(Box, { flexDirection: "column", flexGrow: 1, children: sessions.map((session, index) => (_jsx(Box, { children: _jsxs(Text, { color: index === selectedIndex ? 'cyan' : 'white', children: [index === selectedIndex ? '▶ ' : '  ', session] }) }, session))) }), _jsx(Box, { marginTop: 1, borderStyle: "single", borderColor: "gray", paddingX: 1, children: _jsx(Text, { color: "gray", children: "\u2191/\u2193 Scroll \u2022 Enter Select \u2022 Esc Close" }) })] }) }));
};
//# sourceMappingURL=SessionManager.js.map