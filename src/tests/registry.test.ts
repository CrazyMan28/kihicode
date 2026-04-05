import { describe, it, expect } from 'vitest';
import { CommandRegistry } from '../commands/registry';

describe('CommandRegistry', () => {
  it('registers and executes a command', async () => {
    const registry = new CommandRegistry();
    const results: any[] = [];
    const cmd = {
      name: 'testcmd',
      description: 'a test command',
      async execute(ctx: any, args: string[]) {
        results.push({ ctxSent: ctx.marker, args });
      }
    } as any;
    registry.register(cmd);
    const ctx = { stdout: () => {}, exit: () => {}, marker: 'ok', registry } as any;
    await registry.execute('/testcmd one two', ctx);
    expect(results.length).toBe(1);
    expect(results[0].args).toEqual(['one', 'two']);
    expect(results[0].ctxSent).toBe('ok');
  });
});
