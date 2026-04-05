import { describe, it, expect } from 'vitest';
import { parseSlash } from '../commands/parser.js';

describe('parseSlash', () => {
  it('parses simple command without args', () => {
    const res = parseSlash('/help');
    expect(res.name).toBe('help');
    expect(res.args).toEqual([]);
  });

  it('parses flags and values', () => {
    const res = parseSlash('/login --provider openai --key sk-abc123');
    expect(res.name).toBe('login');
    expect(res.args).toEqual(['--provider', 'openai', '--key', 'sk-abc123']);
  });

  it('parses quoted arguments', () => {
    const res = parseSlash('/echo "hello world" \"inner\"');
    expect(res.name).toBe('echo');
    expect(res.args[0]).toBe('hello world');
  });
});
