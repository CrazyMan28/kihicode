export declare const Tools: {
    executeShell(command: string): Promise<{
        stdout: any;
        stderr: any;
        exitCode: any;
    }>;
    readFile(filePath: string): Promise<{
        content: string;
        error?: undefined;
    } | {
        error: any;
        content?: undefined;
    }>;
    writeFile(filePath: string, content: string): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        error: any;
        success?: undefined;
    }>;
};
