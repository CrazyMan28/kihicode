import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const CommandPalette = ({ commands, selectedIndex }) => {
    if (commands.length === 0)
        return null;
    return (_jsx(Box, { flexDirection: "column", borderStyle: "round", borderColor: "magenta", paddingX: 1, children: commands.map((cmd, index) => (_jsx(Box, { children: _jsxs(Text, { color: index === selectedIndex ? 'magenta' : 'white', inverse: index === selectedIndex, children: [index === selectedIndex ? '› ' : '  ', cmd] }) }, cmd))) }));
};
//# sourceMappingURL=CommandPalette.js.map