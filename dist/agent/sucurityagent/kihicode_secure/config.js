"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureConfigDir = ensureConfigDir;
exports.loadConfig = loadConfig;
exports.saveConfig = saveConfig;
exports.setApiKey = setApiKey;
exports.getApiKey = getApiKey;
exports.setApiUrl = setApiUrl;
exports.getApiUrl = getApiUrl;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os_1 = __importDefault(require("os"));
const CONFIG_DIR = path.join(os_1.default.homedir(), ".kihicode");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");
function ensureConfigDir() {
    try {
        fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
        try {
            fs.chmodSync(CONFIG_DIR, 0o700);
        }
        catch (e) {
            // ignore
        }
    }
    catch (e) {
        // ignore
    }
}
function loadConfig() {
    ensureConfigDir();
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            const txt = fs.readFileSync(CONFIG_FILE, { encoding: "utf8" });
            return JSON.parse(txt || "{}");
        }
    }
    catch (e) {
        return {};
    }
    return {};
}
function saveConfig(cfg) {
    ensureConfigDir();
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), { encoding: "utf8" });
    try {
        fs.chmodSync(CONFIG_FILE, 0o600);
    }
    catch (e) {
        // ignore
    }
}
function setApiKey(key) {
    const cfg = loadConfig();
    cfg["mistral_api_key"] = key;
    saveConfig(cfg);
}
function getApiKey() {
    return loadConfig()["mistral_api_key"];
}
function setApiUrl(url) {
    const cfg = loadConfig();
    cfg["mistral_api_url"] = url;
    saveConfig(cfg);
}
function getApiUrl() {
    return loadConfig()["mistral_api_url"];
}
