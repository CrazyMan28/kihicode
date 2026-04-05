import React from 'react';
import { Box, Text } from 'ink';
import { TerminalLog } from '../../store/agentStore.js';

export const TerminalPane: React.FC<{ logs: TerminalLog[] }> = ({ logs }) => {
  return (
    <Box flexDirection="column" flexGrow={1} overflowY="hidden">
      {logs.slice(-20).map((log, i) => (
        <Box key={i}>
          <Text color={log.type === 'command' ? 'cyan' : log.type === 'error' ? 'red' : 'white'}>
            {log.type === 'command' ? '> ' : ''}{log.content}
          </Text>
        </Box>
      ))}
    </Box>
  );
};
