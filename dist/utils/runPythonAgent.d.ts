export declare function runPythonAgent(args: string[]): Promise<{
    stdout: string;
    stderr: string;
    code: number | null;
}>;
export default runPythonAgent;
