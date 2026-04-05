import Conf from "conf";

export class AuthStore {
  private config: any;

  constructor() {
    this.config = new (Conf as any)({
      projectName: 'kihicode',
      encryptionKey: 'kihicode-secret-2026' // In production, this should be more robust
    });
  }

  setKey(provider: string, key: string) {
    this.config.set(`keys.${provider}`, key);
  }

  getKey(provider: string): string | undefined {
    return this.config.get(`keys.${provider}`) as string | undefined;
  }

  clearKeys() {
    this.config.clear();
  }
}
