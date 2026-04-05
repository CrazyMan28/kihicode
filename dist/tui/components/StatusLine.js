import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
export const StatusLine = ({ status, thoughts }) => {
    const [dots, setDots] = useState('');
    useEffect(() => {
        const i = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
        return () => clearInterval(i);
    }, []);
    return (_jsxs(Box, { borderStyle: "single", borderColor: "blue", paddingX: 1, marginTop: 1, children: [_jsx(Text, { bold: true, color: "yellow", children: "STATUS: " }), _jsxs(Text, { color: "cyan", children: [status.toUpperCase(), status === 'thinking' || status === 'acting' ? dots : ''] }), _jsx(Box, { marginLeft: 2, children: _jsx(Text, { color: "gray", italic: true, children: thoughts }) })] }));
};
//# sourceMappingURL=StatusLine.js.map