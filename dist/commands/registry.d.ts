import { Command } from './Command.js';
export declare class CommandRegistry {
    private commands;
    register(cmd: Command): void;
    list(): Command[];
    get(name: string): Command | undefined;
    execute(rawInput: string, ctx: any): Promise<void>;
}
