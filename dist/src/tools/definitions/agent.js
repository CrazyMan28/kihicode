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
exports.registerAgentTools = registerAgentTools;
const zod_1 = require("zod");
const registry_js_1 = require("../registry.js");
const manager_js_1 = require("../../subagent/manager.js");
function registerAgentTools() {
    registry_js_1.registry.register({
        name: 'invokeSubagent',
        description: 'Invoke a named subagent (runs as a background job).',
        schema: zod_1.z.object({
            agent: zod_1.z.string().describe('The agent module name under src/subagent/agents (no extension).'),
            args: zod_1.z.any().optional().describe('Arguments to pass to the agent')
        }),
        sensitive: false,
        execute: async (args) => {
            if (!args || !args.agent)
                return 'Error: missing `agent` parameter.';
            const agentName = args.agent;
            try {
                const mod = await Promise.resolve(`${`../../subagent/agents/${agentName}.js`}`).then(s => __importStar(require(s)));
                const runFn = mod.run || mod.default;
                if (!runFn)
                    return `Agent '${agentName}' does not export a 'run' function.`;
                const id = manager_js_1.subagentManager.start(async () => {
                    return await runFn(args.args ?? args);
                });
                return `Started subagent job: ${id}`;
            }
            catch (err) {
                return `Failed to invoke agent '${agentName}': ${err?.message ?? String(err)}`;
            }
        }
    });
}
