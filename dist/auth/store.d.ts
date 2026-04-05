export default class AuthStore {
    private passphrase;
    constructor();
    private ensureDir;
    private encrypt;
    private decrypt;
    saveCredentials(provider: string, apiKey: string): Promise<void>;
    getCredentials(provider: string): Promise<any>;
    listProviders(): Promise<string[]>;
    deleteCredentials(provider: string): Promise<void>;
}
