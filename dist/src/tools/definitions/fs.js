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
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerFsTools = registerFsTools;
const zod_1 = require("zod");
const fs = __importStar(require("node:fs/promises"));
const registry_js_1 = require("../registry.js");
function registerFsTools() {
    registry_js_1.registry.register({
        name: 'readFile',
        description: 'Reads the content of a file.',
        schema: zod_1.z.object({
            path: zod_1.z.string().describe('The path to the file to read.')
        }),
        sensitive: false,
        execute: async (args) => {
            return await fs.readFile(args.path, 'utf8');
        }
    });
    registry_js_1.registry.register({
        name: 'writeFile',
        description: 'Writes content to a file.',
        schema: zod_1.z.object({
            path: zod_1.z.string().describe('The path to the file to write to.'),
            content: zod_1.z.string().describe('The content to write.')
        }),
        sensitive: true,
        execute: async (args) => {
            await fs.writeFile(args.path, args.content, 'utf8');
            return `File ${args.path} written successfully.`;
        }
    });
    registry_js_1.registry.register({
        name: 'listDir',
        description: 'Lists the contents of a directory.',
        schema: zod_1.z.object({
            path: zod_1.z.string().describe('The path to the directory to list.')
        }),
        sensitive: false,
        execute: async (args) => {
            const files = await fs.readdir(args.path);
            return files.join('\n');
        }
    });
}
