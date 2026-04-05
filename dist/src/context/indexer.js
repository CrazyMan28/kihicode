"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const STORE_DIR = path_1.default.join(os_1.default.homedir(), '.kihicode');
const STORE_FILE = path_1.default.join(STORE_DIR, 'context.json');
class Indexer {
    async ensureDir() {
        await fs_1.promises.mkdir(STORE_DIR, { recursive: true });
    }
    async addDir(dirPath) {
        await this.ensureDir();
        const resolved = path_1.default.resolve(dirPath);
        let data = { dirs: [] };
        try {
            const exists = await fs_1.promises.stat(STORE_FILE).then(() => true).catch(() => false);
            if (exists) {
                const raw = await fs_1.promises.readFile(STORE_FILE, 'utf8');
                data = JSON.parse(raw);
            }
        }
        catch (err) { }
        if (!data.dirs.includes(resolved))
            data.dirs.push(resolved);
        await fs_1.promises.writeFile(STORE_FILE, JSON.stringify(data, null, 2), { mode: 0o600 });
    }
    async listDirs() {
        try {
            const raw = await fs_1.promises.readFile(STORE_FILE, 'utf8');
            const json = JSON.parse(raw);
            return json.dirs || [];
        }
        catch (err) {
            return [];
        }
    }
    async listFiles(dirPath) {
        try {
            const entries = await fs_1.promises.readdir(dirPath, { withFileTypes: true });
            return entries.filter(e => e.isFile()).map(e => e.name);
        }
        catch (err) {
            return [];
        }
    }
}
exports.default = Indexer;
