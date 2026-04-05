"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const clearCommand = {
    name: 'clear',
    description: 'Clear the screen',
    execute() {
        process.stdout.write('\x1Bc');
    },
};
exports.default = clearCommand;
