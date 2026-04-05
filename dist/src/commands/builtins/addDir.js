"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inquirer_1 = __importDefault(require("inquirer"));
const indexer_1 = __importDefault(require("../../context/indexer"));
const indexer = new indexer_1.default();
const addDirCommand = {
    name: 'add-dir',
    description: 'Add a directory to project context',
    async execute(ctx, args) {
        let dir = args && args.length ? args[0] : undefined;
        if (!dir) {
            const res = await inquirer_1.default.prompt([{ type: 'input', name: 'dir', message: 'Directory to add' }]);
            dir = res.dir;
        }
        if (!dir) {
            ctx.stdout('No directory provided.');
            return;
        }
        try {
            await indexer.addDir(dir);
            ctx.stdout(`Added directory: ${dir}`);
        }
        catch (err) {
            ctx.stdout(`Error adding directory: ${err?.message ?? String(err)}`);
        }
    },
};
exports.default = addDirCommand;
