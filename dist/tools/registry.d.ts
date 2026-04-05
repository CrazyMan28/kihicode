import { z } from 'zod';
export interface ToolDefinition {
    name: string;
    description: string;
    schema: z.ZodObject<any>;
    execute: (args: any) => Promise<string | void>;
    sensitive: boolean;
}
export declare class ToolRegistry {
    private tools;
    register(tool: ToolDefinition): void;
    getTool(name: string): ToolDefinition | undefined;
    getAllTools(): ToolDefinition[];
    getJsonSchema(): {
        name: string;
        description: string;
        input_schema: {
            type: string;
            properties: any;
        };
    }[];
}
export declare const registry: ToolRegistry;
