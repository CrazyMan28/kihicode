import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';

interface SessionManagerProps {
  sessions: string[];
  onSelect: (session: string) => void;
  onClose: () => void;
}

export const SessionManager: React.FC<SessionManagerProps> = ({ sessions, onSelect, onClose }) => {
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
        borderColor="cyan"
        padding={1}
        width={50}
        minHeight={10}
      >
        <Box justifyContent="center" marginBottom={1}>
          <Text bold color="yellow" underline>
            SESSION MANAGER
          </Text>
        </Box>

        <Box flexDirection="column" flexGrow={1}>
          {sessions.map((session, index) => (
            <Box key={session}>
              <Text color={index === selectedIndex ? 'cyan' : 'white'}>
                {index === selectedIndex ? '▶ ' : '  '}
                {session}
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
