import { promises as fsp } from 'fs';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

const STORE_DIR = path.join(os.homedir(), '.kihicode');
const STORE_FILE = path.join(STORE_DIR, 'credentials.json.enc');

export default class AuthStore {
  private passphrase: string | undefined;
  constructor() {
    this.passphrase = process.env.KIHICODE_STORE_PASSPHRASE;
  }
  private async ensureDir() {
    await fsp.mkdir(STORE_DIR, { recursive: true });
  }
  private encrypt(text: string) {
    if (!this.passphrase) return text;
    const iv = crypto.randomBytes(12);
    const key = crypto.scryptSync(this.passphrase, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return Buffer.concat([iv, tag, enc]).toString('base64');
  }
  private decrypt(b64: string) {
    if (!this.passphrase) return b64;
    const data = Buffer.from(b64, 'base64');
    const iv = data.slice(0, 12);
    const tag = data.slice(12, 28);
    const enc = data.slice(28);
    const key = crypto.scryptSync(this.passphrase, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    const out = decipher.update(enc, undefined, 'utf8') + decipher.final('utf8');
    return out;
  }
  async saveCredentials(provider: string, apiKey: string) {
    await this.ensureDir();
    let data: Record<string, any> = {};
    try {
      const exists = await fsp.stat(STORE_FILE).then(() => true).catch(() => false);
      if (exists) {
        const raw = await fsp.readFile(STORE_FILE, 'utf8');
        const json = this.passphrase ? JSON.parse(this.decrypt(raw)) : JSON.parse(raw);
        data = json;
      }
    } catch (err) {
      // ignore
    }
    data[provider] = { apiKey, updatedAt: new Date().toISOString() };
    const str = JSON.stringify(data, null, 2);
    const out = this.passphrase ? this.encrypt(str) : str;
    await fsp.writeFile(STORE_FILE, out, { mode: 0o600 });
  }
  async getCredentials(provider: string) {
    try {
      const exists = await fsp.stat(STORE_FILE).then(() => true).catch(() => false);
      if (!exists) return null;
      const raw = await fsp.readFile(STORE_FILE, 'utf8');
      const json = this.passphrase ? JSON.parse(this.decrypt(raw)) : JSON.parse(raw);
      return json[provider] ?? null;
    } catch (err) {
      return null;
    }
  }
  async listProviders() {
    try {
      const exists = await fsp.stat(STORE_FILE).then(() => true).catch(() => false);
      if (!exists) return [];
      const raw = await fsp.readFile(STORE_FILE, 'utf8');
      const json = this.passphrase ? JSON.parse(this.decrypt(raw)) : JSON.parse(raw);
      return Object.keys(json);
    } catch (err) {
      return [];
    }
  }
  async deleteCredentials(provider: string) {
    try {
      const raw = await fsp.readFile(STORE_FILE, 'utf8');
      const json = this.passphrase ? JSON.parse(this.decrypt(raw)) : JSON.parse(raw);
      delete json[provider];
      const str = JSON.stringify(json, null, 2);
      const out = this.passphrase ? this.encrypt(str) : str;
      await fsp.writeFile(STORE_FILE, out, { mode: 0o600 });
    } catch (err) { /* ignore */ }
  }
}
