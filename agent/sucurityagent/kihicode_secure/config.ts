import * as fs from "fs";
import * as path from "path";
import os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".kihicode");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function ensureConfigDir() {
  try {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
    try {
      fs.chmodSync(CONFIG_DIR, 0o700);
    } catch (e) {
      // ignore
    }
  } catch (e) {
    // ignore
  }
}

export function loadConfig(): Record<string, any> {
  ensureConfigDir();
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const txt = fs.readFileSync(CONFIG_FILE, { encoding: "utf8" });
      return JSON.parse(txt || "{}");
    }
  } catch (e) {
    return {};
  }
  return {};
}

export function saveConfig(cfg: Record<string, any>) {
  ensureConfigDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), { encoding: "utf8" });
  try {
    fs.chmodSync(CONFIG_FILE, 0o600);
  } catch (e) {
    // ignore
  }
}

export function setApiKey(key: string) {
  const cfg = loadConfig();
  cfg["mistral_api_key"] = key;
  saveConfig(cfg);
}

export function getApiKey(): string | undefined {
  return loadConfig()["mistral_api_key"];
}

export function setApiUrl(url: string) {
  const cfg = loadConfig();
  cfg["mistral_api_url"] = url;
  saveConfig(cfg);
}

export function getApiUrl(): string | undefined {
  return loadConfig()["mistral_api_url"];
}
