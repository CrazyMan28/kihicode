"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const STORE_DIR = path_1.default.join(os_1.default.homedir(), '.kihicode');
const STORE_FILE = path_1.default.join(STORE_DIR, 'memory.json');
class MemoryStore {
    async ensureDir() {
        await fs_1.promises.mkdir(STORE_DIR, { recursive: true });
    }
    async remember(text) {
        await this.ensureDir();
        let data = { notes: [] };
        try {
            const exists = await fs_1.promises.stat(STORE_FILE).then(() => true).catch(() => false);
            if (exists) {
                const raw = await fs_1.promises.readFile(STORE_FILE, 'utf8');
                data = JSON.parse(raw);
            }
        }
        catch (err) { }
        const item = { id: Date.now().toString(36), text, createdAt: new Date().toISOString() };
        data.notes.push(item);
        await fs_1.promises.writeFile(STORE_FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
        return item;
    }
    async list() {
        try {
            const raw = await fs_1.promises.readFile(STORE_FILE, 'utf8');
            const json = JSON.parse(raw);
            return json.notes || [];
        }
        catch (err) {
            return [];
        }
    }
    async forget(id) {
        try {
            const raw = await fs_1.promises.readFile(STORE_FILE, 'utf8');
            const json = JSON.parse(raw);
            json.notes = (json.notes || []).filter((n) => n.id !== id);
            await fs_1.promises.writeFile(STORE_FILE, JSON.stringify(json, null, 2), { mode: 0o600 });
            return true;
        }
        catch (err) {
            return false;
        }
    }
}
exports.default = MemoryStore;
