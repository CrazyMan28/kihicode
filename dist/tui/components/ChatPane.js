import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const ChatPane = ({ messages }) => {
    return (_jsx(Box, { flexDirection: "column", flexGrow: 1, overflowY: "hidden", children: messages.slice(-10).map((msg, i) => (_jsxs(Box, { marginBottom: 1, children: [_jsxs(Text, { color: msg.role === 'user' ? 'blue' : msg.role === 'agent' ? 'green' : 'gray', bold: true, children: [msg.role.toUpperCase(), ":"] }), _jsxs(Text, { children: [" ", msg.content] })] }, i))) }));
};
//# sourceMappingURL=ChatPane.js.map