export interface CommandContext {
  stdout: (msg: string) => void;
  exit: (code?: number) => void;
  registry?: any;
  subagentManager?: any;
  authStore?: any;
}

export interface Command {
  name: string;
  description?: string;
  execute: (ctx: CommandContext, args: string[]) => Promise<void> | void;
}
