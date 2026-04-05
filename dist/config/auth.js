import Conf from "conf";
export class AuthStore {
    config;
    constructor() {
        this.config = new Conf({
            projectName: 'kihicode',
            encryptionKey: 'kihicode-secret-2026' // In production, this should be more robust
        });
    }
    setKey(provider, key) {
        this.config.set(`keys.${provider}`, key);
    }
    getKey(provider) {
        return this.config.get(`keys.${provider}`);
    }
    clearKeys() {
        this.config.clear();
    }
}
//# sourceMappingURL=auth.js.map