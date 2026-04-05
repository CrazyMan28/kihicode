export declare function parseArguments(): {
    command: string;
    flags: {
        yolo: boolean | undefined;
        verbose: boolean | undefined;
    } & Record<string, unknown>;
};
