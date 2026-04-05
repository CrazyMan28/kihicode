import { CommandRegistry } from './registry.js';
import helpCommand from './builtins/help.js';
import exitCommand from './builtins/exit.js';
import loginCommand from './login.js';
import clearCommand from './builtins/clear.js';
import statusCommand from './builtins/status.js';
import addDirCommand from './builtins/addDir.js';
import contextCommand from './builtins/context.js';
import rememberCommand from './builtins/remember.js';
import memoryCommand from './builtins/memory.js';
import forgetCommand from './builtins/forget.js';
import subagentCommand from './builtins/subagent.js';
import logoutCommand from './builtins/logout.js';
import { loadCustomCommands } from './loader.js';
export const registry = new CommandRegistry();
export async function initCommands() {
    // avoid double-registration
    if (registry.list().length > 0)
        return;
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
    loadCustomCommands(registry).catch(() => { });
}
export default registry;
//# sourceMappingURL=index.js.map