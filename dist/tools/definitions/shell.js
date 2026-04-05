"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerShellTools = registerShellTools;
const zod_1 = require("zod");
const execa_1 = require("execa");
const registry_js_1 = require("../registry.js");
function registerShellTools() {
    registry_js_1.registry.register({
        name: 'executeCommand',
        description: 'Executes a shell command.',
        schema: zod_1.z.object({
            command: zod_1.z.string().describe('The command to execute.'),
            args: zod_1.z.array(zod_1.z.string()).optional().describe('Optional arguments for the command.')
        }),
        sensitive: true,
        execute: async (args) => {
            try {
                const { stdout, stderr } = await (0, execa_1.execa)(args.command, args.args || [], { shell: true });
                return stdout || stderr;
            }
            catch (error) {
                return `Error: ${error.message}\n${error.stderr}`;
            }
        }
    });
}
