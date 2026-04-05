import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { ChatPane } from './components/ChatPane.js';
import { TerminalPane } from './components/TerminalPane.js';
import { StatusLine } from './components/StatusLine.js';
import { SelectionModal } from './components/SelectionModal.js';
import { CommandPalette } from './components/CommandPalette.js';
import { CommandRouter } from '../commands/router.js';
import { AgentLoop } from '../agent/loop.js';
import { useAgentStore } from '../store/agentStore.js';
import { AuthStore } from '../config/auth.js';
import { WebsiteController } from '../server/web.js';

interface KihicodeAppProps {
  initialCommand?: string;
}

const ALL_COMMANDS = [
  '/plan', '/build', '/autopilot', '/clear', '/website on', '/website off',
  '/session list', '/compact', '/config', '/context', '/cost', '/diff',
  '/edit', '/init', '/model', '/memory', '/mcp', '/auth', '/login', '/help'
];

export const KihicodeApp: React.FC<KihicodeAppProps> = ({ initialCommand }) => {
  const { exit } = useApp();
  const [input, setInput] = useState('');
  const [isSecret, setIsSecret] = useState(false);
  const [secretType, setSecretType] = useState<string>('');
  const [permissionMode, setPermissionMode] = useState<'Default' | 'Plan' | 'Bypass'>('Default');
  
  const [paletteIndex, setPaletteIndex] = useState(0);
  const [filteredCommands, setFilteredCommands] = useState<string[]>([]);
  
  const agentStore = useAgentStore();

  // Handle trigger for secret input from store
  useEffect(() => {
    if (agentStore.pendingSecretProvider) {
      setIsSecret(true);
      setSecretType(agentStore.pendingSecretProvider);
      agentStore.addMessage('system', `Please enter your ${agentStore.pendingSecretProvider.toUpperCase()} API Key:`);
      agentStore.setPendingSecretProvider(null);
    }
  }, [agentStore.pendingSecretProvider]);

  useEffect(() => {
    if (input.startsWith('/') && !isSecret) {
      const query = input.toLowerCase().split(' ')[0];
      const filtered = ALL_COMMANDS.filter(cmd => cmd.toLowerCase().startsWith(query));
      setFilteredCommands(filtered);
      setPaletteIndex(0);
    } else {
      setFilteredCommands([]);
    }
  }, [input, isSecret]);

  useInput((char, key) => {
    if (agentStore.selectionType) return; // Selection modal handles input

    if (key.escape) {
      exit();
      return;
    }

    // Command Palette Navigation
    if (filteredCommands.length > 0) {
      if (key.upArrow) {
        setPaletteIndex(prev => (prev > 0 ? prev - 1 : filteredCommands.length - 1));
        return;
      }
      if (key.downArrow) {
        setPaletteIndex(prev => (prev < filteredCommands.length - 1 ? prev + 1 : 0));
        return;
      }
      if (key.tab) {
        setInput(filteredCommands[paletteIndex] + ' ');
        return;
      }
    }

    if (key.ctrl && char === 'c') {
        setInput('');
        agentStore.addMessage('system', 'Input cancelled.');
        return;
    }

    if (key.ctrl && char === 'l') {
        agentStore.clearLogs();
        return;
    }

    if (key.ctrl && char === 'o') {
        agentStore.toggleVerbose();
        agentStore.addMessage('system', `Verbose mode: ${agentStore.verbose ? 'ON' : 'OFF'}`);
        return;
    }

    if (key.shift && key.tab) {
        const modes: Array<'Default' | 'Plan' | 'Bypass'> = ['Default', 'Plan', 'Bypass'];
        const nextIdx = (modes.indexOf(permissionMode) + 1) % modes.length;
        setPermissionMode(modes[nextIdx]);
        agentStore.addMessage('system', `Permission Mode: ${modes[nextIdx]}`);
        return;
    }
    
    if (key.return) {
      if (input.trim()) {
        handleCommand(input);
        setInput('');
      }
    } else if (key.backspace || key.delete) {
      setInput(prev => prev.slice(0, -1));
    } else if (char && !key.ctrl && !key.meta) {
      setInput(prev => prev + char);
    }
  });

  const handleCommand = async (cmd: string) => {
    if (isSecret) {
      const auth = new AuthStore();
      auth.setKey(secretType, cmd);
      agentStore.addMessage('system', `${secretType.toUpperCase()} API Key saved.`);
      
      // Update logged-in providers list
      if (!agentStore.loggedInProviders.includes(secretType)) {
        agentStore.setLoggedInProviders(prev => [...prev, secretType]);
      }

      setIsSecret(false);
      setSecretType('');
      return;
    }

    if (cmd.startsWith('/')) {
      await CommandRouter.execute(cmd, agentStore);
    } else {
      await AgentLoop.process(cmd, agentStore);
    }
  };

  useEffect(() => {
    if (agentStore.isWebsiteOn) {
      WebsiteController.start();
    } else {
      WebsiteController.stop();
    }
  }, [agentStore.isWebsiteOn]);

  return (
    <Box flexDirection="column" height="100%" width="100%" padding={1}>
      {agentStore.selectionType && (
        <SelectionModal 
          title={agentStore.selectionType}
          items={agentStore.selectionList}
          onSelect={agentStore.onSelect}
          onClose={() => agentStore.closeSelection()}
        />
      )}

      <Box flexDirection="row" justifyContent="space-between" marginBottom={1}>
        <Text bold color="cyan">KIHICODE OS v1.0.0</Text>
        <Box>
            <Text color="gray">Mode: </Text>
            <Text color={permissionMode === 'Bypass' ? 'red' : permissionMode === 'Plan' ? 'yellow' : 'green'}>{permissionMode}</Text>
            <Text color="gray"> | Model: </Text>
            <Text color="yellow">{agentStore.activeModel}</Text>
            <Text color="gray"> | Web: </Text>
            <Text color={agentStore.isWebsiteOn ? 'green' : 'red'}>{agentStore.isWebsiteOn ? 'ON' : 'OFF'}</Text>
        </Box>
      </Box>

      <Box flexGrow={1} flexDirection="row" borderStyle="round" borderColor="cyan">
        <Box width="40%" flexDirection="column" paddingX={1} borderStyle="single" borderRight={true}>
          <Box borderStyle="single" borderColor="yellow" paddingX={1} marginBottom={1}>
            <Text color="yellow" bold underline>🗨️ AGENT CHAT</Text>
          </Box>
          <ChatPane messages={agentStore.messages} />
        </Box>
        
        <Box width="60%" flexDirection="column" paddingX={1}>
          <Box borderStyle="single" borderColor="green" paddingX={1} marginBottom={1}>
            <Text color="green" bold underline>💻 TERMINAL OUTPUT</Text>
          </Box>
          <TerminalPane logs={agentStore.terminalLogs} />
        </Box>
      </Box>

      <StatusLine status={agentStore.status} thoughts={agentStore.thoughts} />

      <Box flexDirection="column" marginTop={1}>
        {filteredCommands.length > 0 && (
          <Box marginBottom={1} marginLeft={2}>
            <CommandPalette commands={filteredCommands} selectedIndex={paletteIndex} />
          </Box>
        )}
        <Box paddingX={1} borderStyle="round" borderColor="white">
          <Text color="cyan" bold>kihicode&gt; </Text>
          <Text>{isSecret ? '•'.repeat(input.length) : input}</Text>
          <Text color="white" inverse={true}> </Text>
        </Box>
      </Box>
    </Box>
  );
};
