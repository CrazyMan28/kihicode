export default class Indexer {
    private ensureDir;
    addDir(dirPath: string): Promise<void>;
    listDirs(): Promise<any>;
    listFiles(dirPath: string): Promise<string[]>;
}
