"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDynamicTools = registerDynamicTools;
const zod_1 = require("zod");
const fs = __importStar(require("node:fs/promises"));
const node_path_1 = __importDefault(require("node:path"));
const node_os_1 = __importDefault(require("node:os"));
const node_url_1 = require("node:url");
const registry_js_1 = require("../registry.js");
// Store plugins in the user's home directory under ~/.kihicode/plugins
const PLUGINS_DIR = node_path_1.default.join(node_os_1.default.homedir(), '.kihicode', 'plugins');
async function registerDynamicTools() {
    await fs.mkdir(PLUGINS_DIR, { recursive: true });
    registry_js_1.registry.register({
        name: 'createTool',
        description: 'Creates a new tool and adds it to the registry.',
        schema: zod_1.z.object({
            name: zod_1.z.string().describe('The name of the tool.'),
            description: zod_1.z.string().describe('The description of the tool.'),
            code: zod_1.z.string().describe('The TypeScript code for the tool execution function.')
        }),
        sensitive: true,
        execute: async (args) => {
            const fileName = `${args.name}.ts`;
            const filePath = node_path_1.default.join(PLUGINS_DIR, fileName);
            const toolCode = `import { z } from 'zod';
export const name = ${JSON.stringify(args.name)};
export const description = ${JSON.stringify(args.description)};
export const schema = z.object({});
export const sensitive = true;
export const execute = async (args: any) => {
${args.code}
};`;
            await fs.writeFile(filePath, toolCode, 'utf8');
            // Try to dynamically import and register the new tool immediately.
            try {
                const moduleUrl = (0, node_url_1.pathToFileURL)(filePath).href;
                const mod = await Promise.resolve(`${moduleUrl}`).then(s => __importStar(require(s)));
                const toolSchema = mod.schema || zod_1.z.object({});
                const tool = {
                    name: mod.name || args.name,
                    description: mod.description || args.description || '',
                    schema: toolSchema,
                    sensitive: !!mod.sensitive,
                    execute: mod.execute
                };
                registry_js_1.registry.register(tool);
                return `Tool ${tool.name} created and registered from ${filePath}.`;
            }
            catch (err) {
                return `Tool ${args.name} saved to ${filePath}, but hot-reload failed: ${err?.message || err}. Restart Kihicode to load it.`;
            }
        }
    });
}
