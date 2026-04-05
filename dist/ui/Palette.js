"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const ink_1 = require("ink");
const ink_text_input_1 = __importDefault(require("ink-text-input"));
const Palette = ({ commands, onSelect, onClose }) => {
    const [filter, setFilter] = (0, react_1.useState)('');
    const [selected, setSelected] = (0, react_1.useState)(0);
    const filtered = commands.filter(c => (`/${c.name}`.toLowerCase()).includes(filter.toLowerCase()));
    (0, react_1.useEffect)(() => {
        setSelected(0);
    }, [filter]);
    (0, ink_1.useInput)((input, key) => {
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
    return ((0, jsx_runtime_1.jsxs)(ink_1.Box, { flexDirection: "column", borderStyle: "round", padding: 1, marginBottom: 1, width: 80, children: [(0, jsx_runtime_1.jsxs)(ink_1.Box, { children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { bold: true, children: "Command Palette" }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "  (Esc to close)" })] }), (0, jsx_runtime_1.jsx)(ink_1.Box, { marginTop: 1, children: (0, jsx_runtime_1.jsx)(ink_text_input_1.default, { value: filter, onChange: setFilter, placeholder: "Type to filter commands" }) }), (0, jsx_runtime_1.jsxs)(ink_1.Box, { marginTop: 1, flexDirection: "column", children: [filtered.length === 0 && (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: "No matching commands" }), filtered.slice(0, 12).map((c, i) => ((0, jsx_runtime_1.jsxs)(ink_1.Box, { children: [(0, jsx_runtime_1.jsx)(ink_1.Text, { color: i === selected ? 'cyan' : undefined, children: i === selected ? '» ' : '  ' }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: i === selected ? 'cyan' : undefined, children: `/${c.name}` }), (0, jsx_runtime_1.jsx)(ink_1.Text, { color: "gray", children: ` — ${c.description || ''}` })] }, c.name)))] })] }));
};
exports.default = Palette;
