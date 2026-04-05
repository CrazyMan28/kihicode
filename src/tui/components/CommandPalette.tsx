import React from 'react';
import { Box, Text } from 'ink';

interface CommandPaletteProps {
  commands: string[];
  selectedIndex: number;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ commands, selectedIndex }) => {
  if (commands.length === 0) return null;

  return (
    <Box
      flexDirection="column"
      borderStyle="round"
      borderColor="magenta"
      paddingX={1}
    >
      {commands.map((cmd, index) => (
        <Box key={cmd}>
          <Text color={index === selectedIndex ? 'magenta' : 'white'} inverse={index === selectedIndex}>
            {index === selectedIndex ? '› ' : '  '}
            {cmd}
          </Text>
        </Box>
      ))}
    </Box>
  );
};
