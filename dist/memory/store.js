import { promises as fsp } from 'fs';
import path from 'path';
import os from 'os';
const STORE_DIR = path.join(os.homedir(), '.kihicode');
const STORE_FILE = path.join(STORE_DIR, 'memory.json');
export default class MemoryStore {
    async ensureDir() {
        await fsp.mkdir(STORE_DIR, { recursive: true });
    }
    async remember(text) {
        await this.ensureDir();
        let data = { notes: [] };
        try {
            const exists = await fsp.stat(STORE_FILE).then(() => true).catch(() => false);
            if (exists) {
                const raw = await fsp.readFile(STORE_FILE, 'utf8');
                data = JSON.parse(raw);
            }
        }
        catch (err) { }
        const item = { id: Date.now().toString(36), text, createdAt: new Date().toISOString() };
        data.notes.push(item);
        await fsp.writeFile(STORE_FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
        return item;
    }
    async list() {
        try {
            const raw = await fsp.readFile(STORE_FILE, 'utf8');
            const json = JSON.parse(raw);
            return json.notes || [];
        }
        catch (err) {
            return [];
        }
    }
    async forget(id) {
        try {
            const raw = await fsp.readFile(STORE_FILE, 'utf8');
            const json = JSON.parse(raw);
            json.notes = (json.notes || []).filter((n) => n.id !== id);
            await fsp.writeFile(STORE_FILE, JSON.stringify(json, null, 2), { mode: 0o600 });
            return true;
        }
        catch (err) {
            return false;
        }
    }
}
//# sourceMappingURL=store.js.map