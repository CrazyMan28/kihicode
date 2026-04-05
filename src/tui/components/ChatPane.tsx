import React from 'react';
import { Box, Text } from 'ink';
import { Message } from '../../store/agentStore.js';

export const ChatPane: React.FC<{ messages: Message[] }> = ({ messages }) => {
  return (
    <Box flexDirection="column" flexGrow={1} overflowY="hidden">
      {messages.slice(-10).map((msg, i) => (
        <Box key={i} marginBottom={1}>
          <Text color={msg.role === 'user' ? 'blue' : msg.role === 'agent' ? 'green' : 'gray'} bold>
            {msg.role.toUpperCase()}:
          </Text>
          <Text> {msg.content}</Text>
        </Box>
      ))}
    </Box>
  );
};
