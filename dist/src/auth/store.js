"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const crypto_1 = __importDefault(require("crypto"));
const STORE_DIR = path_1.default.join(os_1.default.homedir(), '.kihicode');
const STORE_FILE = path_1.default.join(STORE_DIR, 'credentials.json.enc');
class AuthStore {
    constructor() {
        this.passphrase = process.env.KIHICODE_STORE_PASSPHRASE;
    }
    async ensureDir() {
        await fs_1.promises.mkdir(STORE_DIR, { recursive: true });
    }
    encrypt(text) {
        if (!this.passphrase)
            return text;
        const iv = crypto_1.default.randomBytes(12);
        const key = crypto_1.default.scryptSync(this.passphrase, 'salt', 32);
        const cipher = crypto_1.default.createCipheriv('aes-256-gcm', key, iv);
        const enc = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        const tag = cipher.getAuthTag();
        return Buffer.concat([iv, tag, enc]).toString('base64');
    }
    decrypt(b64) {
        if (!this.passphrase)
            return b64;
        const data = Buffer.from(b64, 'base64');
        const iv = data.slice(0, 12);
        const tag = data.slice(12, 28);
        const enc = data.slice(28);
        const key = crypto_1.default.scryptSync(this.passphrase, 'salt', 32);
        const decipher = crypto_1.default.createDecipheriv('aes-256-gcm', key, iv);
        decipher.setAuthTag(tag);
        const out = decipher.update(enc, undefined, 'utf8') + decipher.final('utf8');
        return out;
    }
    async saveCredentials(provider, apiKey) {
        await this.ensureDir();
        let data = {};
        try {
            const exists = await fs_1.promises.stat(STORE_FILE).then(() => true).catch(() => false);
            if (exists) {
                const raw = await fs_1.promises.readFile(STORE_FILE, 'utf8');
                const json = this.passphrase ? JSON.parse(this.decrypt(raw)) : JSON.parse(raw);
                data = json;
            }
        }
        catch (err) {
            // ignore
        }
        data[provider] = { apiKey, updatedAt: new Date().toISOString() };
        const str = JSON.stringify(data, null, 2);
        const out = this.passphrase ? this.encrypt(str) : str;
        await fs_1.promises.writeFile(STORE_FILE, out, { mode: 0o600 });
    }
    async getCredentials(provider) {
        try {
            const exists = await fs_1.promises.stat(STORE_FILE).then(() => true).catch(() => false);
            if (!exists)
                return null;
            const raw = await fs_1.promises.readFile(STORE_FILE, 'utf8');
            const json = this.passphrase ? JSON.parse(this.decrypt(raw)) : JSON.parse(raw);
            return json[provider] ?? null;
        }
        catch (err) {
            return null;
        }
    }
    async listProviders() {
        try {
            const exists = await fs_1.promises.stat(STORE_FILE).then(() => true).catch(() => false);
            if (!exists)
                return [];
            const raw = await fs_1.promises.readFile(STORE_FILE, 'utf8');
            const json = this.passphrase ? JSON.parse(this.decrypt(raw)) : JSON.parse(raw);
            return Object.keys(json);
        }
        catch (err) {
            return [];
        }
    }
    async deleteCredentials(provider) {
        try {
            const raw = await fs_1.promises.readFile(STORE_FILE, 'utf8');
            const json = this.passphrase ? JSON.parse(this.decrypt(raw)) : JSON.parse(raw);
            delete json[provider];
            const str = JSON.stringify(json, null, 2);
            const out = this.passphrase ? this.encrypt(str) : str;
            await fs_1.promises.writeFile(STORE_FILE, out, { mode: 0o600 });
        }
        catch (err) { /* ignore */ }
    }
}
exports.default = AuthStore;
