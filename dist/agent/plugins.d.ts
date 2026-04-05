export declare const PluginLoader: {
    loadPlugins(): Promise<Record<string, any>>;
    createPlugin(name: string, description: string, code: string): Promise<string>;
};
