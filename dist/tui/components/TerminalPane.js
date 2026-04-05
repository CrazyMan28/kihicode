import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const TerminalPane = ({ logs }) => {
    return (_jsx(Box, { flexDirection: "column", flexGrow: 1, overflowY: "hidden", children: logs.slice(-20).map((log, i) => (_jsx(Box, { children: _jsxs(Text, { color: log.type === 'command' ? 'cyan' : log.type === 'error' ? 'red' : 'white', children: [log.type === 'command' ? '> ' : '', log.content] }) }, i))) }));
};
//# sourceMappingURL=TerminalPane.js.map