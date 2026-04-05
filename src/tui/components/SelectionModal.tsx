import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface SelectionModalProps {
  title: string;
  items: string[];
  onSelect: (item: string) => void;
  onClose: () => void;
}

export const SelectionModal: React.FC<SelectionModalProps> = ({ title, items, onSelect, onClose }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : items.length - 1));
    }
    if (key.downArrow) {
      setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : 0));
    }
    if (key.return) {
      onSelect(items[selectedIndex]);
    }
    if (key.escape) {
      onClose();
    }
  });

  return (
    <Box
      position="absolute"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        flexDirection="column"
        borderStyle="double"
        borderColor="magenta"
        padding={1}
        width={50}
        minHeight={10}
        backgroundColor="#111"
      >
        <Box justifyContent="center" marginBottom={1}>
          <Text bold color="yellow" underline>
            {title.toUpperCase()}
          </Text>
        </Box>

        <Box flexDirection="column" flexGrow={1}>
          {items.map((item, index) => (
            <Box key={item}>
              <Text color={index === selectedIndex ? 'magenta' : 'white'} inverse={index === selectedIndex}>
                {index === selectedIndex ? '▶ ' : '  '}
                {item}
              </Text>
            </Box>
          ))}
        </Box>

        <Box marginTop={1} borderStyle="single" borderColor="gray" paddingX={1}>
          <Text color="gray">↑/↓ Scroll • Enter Select • Esc Close</Text>
        </Box>
      </Box>
    </Box>
  );
};
