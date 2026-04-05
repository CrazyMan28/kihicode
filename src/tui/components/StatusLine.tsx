import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';

export const StatusLine: React.FC<{ status: string, thoughts: string }> = ({ status, thoughts }) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const i = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500);
    return () => clearInterval(i);
  }, []);

  return (
    <Box borderStyle="single" borderColor="blue" paddingX={1} marginTop={1}>
      <Text bold color="yellow">STATUS: </Text>
      <Text color="cyan">{status.toUpperCase()}{status === 'thinking' || status === 'acting' ? dots : ''}</Text>
      <Box marginLeft={2}>
        <Text color="gray" italic>{thoughts}</Text>
      </Box>
    </Box>
  );
};
