import { Command } from './Command.js';
export declare function loadCustomCommands(registry: {
    register: (c: Command) => void;
}, baseDir?: string): Promise<void>;
declare const _default: {
    loadCustomCommands: typeof loadCustomCommands;
};
export default _default;
