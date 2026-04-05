"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPythonAgent = runPythonAgent;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
async function runPythonAgent(args) {
    return new Promise((resolve) => {
        const script = path_1.default.resolve(process.cwd(), 'agent', 'kihicode-secure');
        const proc = (0, child_process_1.spawn)(script, args, { stdio: ['ignore', 'pipe', 'pipe'] });
        let out = '';
        let err = '';
        if (proc.stdout) {
            proc.stdout.setEncoding('utf8');
            proc.stdout.on('data', (d) => { out += d; });
        }
        if (proc.stderr) {
            proc.stderr.setEncoding('utf8');
            proc.stderr.on('data', (d) => { err += d; });
        }
        proc.on('close', (code) => resolve({ stdout: out, stderr: err, code }));
        proc.on('error', (e) => resolve({ stdout: out, stderr: String(e), code: null }));
    });
}
exports.default = runPythonAgent;
