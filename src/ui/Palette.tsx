import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';

interface CommandItem {
  name: string;
  description?: string;
}

const Palette: React.FC<{
  commands: CommandItem[];
  onSelect: (name: string) => void;
  onClose: () => void;
}> = ({ commands, onSelect, onClose }) => {
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(0);

  const filtered = commands.filter(c => (`/${c.name}`.toLowerCase()).includes(filter.toLowerCase()));

  useEffect(() => {
    setSelected(0);
  }, [filter]);

  useInput((input: string, key: any) => {
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
      if (sel) onSelect(sel.name);
      return;
    }
    // allow typing into filter
    if (!key.ctrl && input && input.length === 1) {
      setFilter(f => f + input);
    }
  });

  return (
    <Box flexDirection="column" borderStyle="round" padding={1} marginBottom={1} width={80}>
      <Box>
        <Text bold>Command Palette</Text>
        <Text color="gray">  (Esc to close)</Text>
      </Box>
      <Box marginTop={1}>
        <TextInput value={filter} onChange={setFilter} placeholder="Type to filter commands" />
      </Box>
      <Box marginTop={1} flexDirection="column">
        {filtered.length === 0 && <Text color="gray">No matching commands</Text>}
        {filtered.slice(0, 12).map((c, i) => (
          <Box key={c.name}>
            <Text color={i === selected ? 'cyan' : undefined}>{i === selected ? '» ' : '  '}</Text>
            <Text color={i === selected ? 'cyan' : undefined}>{`/${c.name}`}</Text>
            <Text color="gray">{` — ${c.description || ''}`}</Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Palette;
