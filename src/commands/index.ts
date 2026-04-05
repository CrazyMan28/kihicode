import { CommandRegistry } from './registry';
import helpCommand from './builtins/help';
import exitCommand from './builtins/exit';
import loginCommand from './login';
import clearCommand from './builtins/clear';
import statusCommand from './builtins/status';
import addDirCommand from './builtins/addDir';
import contextCommand from './builtins/context';
import rememberCommand from './builtins/remember';
import memoryCommand from './builtins/memory';
import forgetCommand from './builtins/forget';
import subagentCommand from './builtins/subagent';
import logoutCommand from './builtins/logout';
import { loadCustomCommands } from './loader';

export const registry = new CommandRegistry();

export async function initCommands() {
  // avoid double-registration
  if (registry.list().length > 0) return;

  registry.register(helpCommand);
  registry.register(exitCommand);
  registry.register(loginCommand);
  registry.register(clearCommand);
  registry.register(statusCommand);
  registry.register(addDirCommand);
  registry.register(contextCommand);
  registry.register(rememberCommand);
  registry.register(memoryCommand);
  registry.register(forgetCommand);
  registry.register(subagentCommand);
  registry.register(logoutCommand);

  // load user-provided commands if any
  loadCustomCommands(registry).catch(() => {});
}

export default registry;
