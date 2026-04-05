import { spawn } from 'child_process';
import path from 'path';

export async function runPythonAgent(args: string[]): Promise<{ stdout: string; stderr: string; code: number | null }> {
  return new Promise((resolve) => {
    const script = path.resolve(process.cwd(), 'agent', 'kihicode-secure');
    const proc = spawn(script, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    if (proc.stdout) {
      proc.stdout.setEncoding('utf8');
      proc.stdout.on('data', (d: string) => { out += d; });
    }
    if (proc.stderr) {
      proc.stderr.setEncoding('utf8');
      proc.stderr.on('data', (d: string) => { err += d; });
    }
    proc.on('close', (code) => resolve({ stdout: out, stderr: err, code }));
    proc.on('error', (e) => resolve({ stdout: out, stderr: String(e), code: null }));
  });
}

export default runPythonAgent;
