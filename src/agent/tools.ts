import { execa } from 'execa';
import fs from 'fs-extra';
import path from 'path';

export const Tools = {
  async executeShell(command: string) {
    try {
      // Basic security: prevent some dangerous commands
      const blocked = ['rm -rf /', 'chmod -R 777 /', ':(){ :|:& };:'];
      if (blocked.some(b => command.includes(b))) {
        throw new Error('Command blocked for security reasons.');
      }

      const { stdout, stderr, exitCode } = await execa(command, { shell: true, all: true });
      return { stdout, stderr, exitCode };
    } catch (err: any) {
      return { 
        stdout: err.stdout, 
        stderr: err.stderr || err.message, 
        exitCode: err.exitCode || 1 
      };
    }
  },

  async readFile(filePath: string) {
    try {
      const fullPath = path.resolve(filePath);
      const content = await fs.readFile(fullPath, 'utf-8');
      return { content };
    } catch (err: any) {
      return { error: err.message };
    }
  },

  async writeFile(filePath: string, content: string) {
    try {
      const fullPath = path.resolve(filePath);
      await fs.ensureDir(path.dirname(fullPath));
      await fs.writeFile(fullPath, content, 'utf-8');
      return { success: true };
    } catch (err: any) {
      return { error: err.message };
    }
  }
};
