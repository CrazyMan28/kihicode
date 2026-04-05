import { promises as fsp } from 'fs';
import path from 'path';
import os from 'os';

const STORE_DIR = path.join(os.homedir(), '.kihicode');
const STORE_FILE = path.join(STORE_DIR, 'context.json');

export default class Indexer {
  private async ensureDir() {
    await fsp.mkdir(STORE_DIR, { recursive: true });
  }

  async addDir(dirPath: string) {
    await this.ensureDir();
    const resolved = path.resolve(dirPath);
    let data: any = { dirs: [] };
    try {
      const exists = await fsp.stat(STORE_FILE).then(() => true).catch(() => false);
      if (exists) {
        const raw = await fsp.readFile(STORE_FILE, 'utf8');
        data = JSON.parse(raw);
      }
    } catch (err) {}
    if (!data.dirs.includes(resolved)) data.dirs.push(resolved);
    await fsp.writeFile(STORE_FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
  }

  async listDirs() {
    try {
      const raw = await fsp.readFile(STORE_FILE, 'utf8');
      const json = JSON.parse(raw);
      return json.dirs || [];
    } catch (err) {
      return [];
    }
  }

  async listFiles(dirPath: string) {
    try {
      const entries = await fsp.readdir(dirPath, { withFileTypes: true });
      return entries.filter(e => e.isFile()).map(e => e.name);
    } catch (err) {
      return [];
    }
  }
}
