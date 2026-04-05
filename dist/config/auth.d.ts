export declare class AuthStore {
    private config;
    constructor();
    setKey(provider: string, key: string): void;
    getKey(provider: string): string | undefined;
    clearKeys(): void;
}
