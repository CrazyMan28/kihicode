export default class MemoryStore {
    private ensureDir;
    remember(text: string): Promise<{
        id: string;
        text: string;
        createdAt: string;
    }>;
    list(): Promise<any>;
    forget(id: string): Promise<boolean>;
}
