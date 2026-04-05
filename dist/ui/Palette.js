import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
const Palette = ({ commands, onSelect, onClose }) => {
    const [filter, setFilter] = useState('');
    const [selected, setSelected] = useState(0);
    const filtered = commands.filter(c => (`/${c.name}`.toLowerCase()).includes(filter.toLowerCase()));
    useEffect(() => {
        setSelected(0);
    }, [filter]);
    useInput((input, key) => {
        if (key.up) {
            setSelected(s => Math.max(0, s - 1));
            return;
        }
        if (key.down) {
            setSelected(s => Math.min(filtered.length - 1, s + 1));
            return;
        }
        if (key.escape) {
            onClose();
            return;
        }
        if (key.return) {
            const sel = filtered[selected];
            if (sel)
                onSelect(sel.name);
            return;
        }
        // allow typing into filter
        if (!key.ctrl && input && input.length === 1) {
            setFilter(f => f + input);
        }
    });
    return (_jsxs(Box, { flexDirection: "column", borderStyle: "round", padding: 1, marginBottom: 1, width: 80, children: [_jsxs(Box, { children: [_jsx(Text, { bold: true, children: "Command Palette" }), _jsx(Text, { color: "gray", children: "  (Esc to close)" })] }), _jsx(Box, { marginTop: 1, children: _jsx(TextInput, { value: filter, onChange: setFilter, placeholder: "Type to filter commands" }) }), _jsxs(Box, { marginTop: 1, flexDirection: "column", children: [filtered.length === 0 && _jsx(Text, { color: "gray", children: "No matching commands" }), filtered.slice(0, 12).map((c, i) => (_jsxs(Box, { children: [_jsx(Text, { color: i === selected ? 'cyan' : undefined, children: i === selected ? '» ' : '  ' }), _jsx(Text, { color: i === selected ? 'cyan' : undefined, children: `/${c.name}` }), _jsx(Text, { color: "gray", children: ` — ${c.description || ''}` })] }, c.name)))] })] }));
};
export default Palette;
//# sourceMappingURL=Palette.js.map